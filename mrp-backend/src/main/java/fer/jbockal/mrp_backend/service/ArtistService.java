package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.artist.ArtistRequestDto;
import fer.jbockal.mrp_backend.dto.artist.ArtistResponseDto;
import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.ArtistRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.projection.ArtistAlbumRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistBaseRow;
import fer.jbockal.mrp_backend.repository.projection.ArtistSongRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toCollection;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;

    public ArtistService(
            ArtistRepository artistRepository,
            SongRepository songRepository,
            AlbumRepository albumRepository
    ) {
        this.artistRepository = artistRepository;
        this.songRepository = songRepository;
        this.albumRepository = albumRepository;
    }


    @Transactional(readOnly = true)
    public Page<ArtistResponseDto> filterArtists(String name, List<Long> albumIds, List<Long> songIds, Pageable pageable) {
        String nameParam = (name == null || name.isBlank()) ? null : name;
        List<Long> albums = (albumIds == null || albumIds.isEmpty()) ? null : albumIds;
        List<Long> songs  = (songIds  == null || songIds.isEmpty())  ? null : songIds;
        Page<ArtistBaseRow> base = artistRepository.findByFilter(nameParam, albums, songs, pageable);
        return new PageImpl<>(assembleDtos(base.getContent()), pageable, base.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<ArtistResponseDto> getAllArtists() {
        var base = artistRepository.findAllBase();
        return assembleDtos(base);
    }

    @Transactional(readOnly = true)
    public List<ArtistResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) return List.of();
        var base = artistRepository.findBaseByNameFragment(fragment);
        return assembleDtos(base);
    }

    @Transactional(readOnly = true)
    public ArtistResponseDto findById(Long id) {
        ArtistBaseRow row = artistRepository.findBaseById(id);
        if (row == null) throw new IllegalArgumentException("Artist not found: " + id);
        return assembleDtos(List.of(row)).get(0);
    }

    @Transactional(readOnly = true)
    public byte[] getArtistImage(Long id) {
        byte[] bytes = artistRepository.findImageById(id);
        if (bytes == null) throw new IllegalArgumentException("Image not found for artist: " + id);
        return bytes;
    }


    @Transactional
    public ArtistResponseDto createArtist(ArtistRequestDto req) {
        Artist ar = new Artist();
        ar.setName(req.getName());
        ar.setDescription(req.getDescription());
        if (req.getImage() != null) ar.setImage(req.getImage());

        if (req.getSongIds() != null) {
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                ar.getSongs().add(s);
                s.getArtists().add(ar);
            }
        }
        if (req.getAlbumIds() != null) {
            for (Long aid : req.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                ar.getAlbums().add(a);
                a.getArtists().add(ar);
            }
        }

        Artist saved = artistRepository.save(ar);
        return findById(saved.getId());
    }

    @Transactional
    public ArtistResponseDto updateArtist(Long id, ArtistRequestDto req) {
        Artist existing = artistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + id));

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getImage() != null) existing.setImage(req.getImage());

        if (req.getSongIds() != null) {
            existing.getSongs().forEach(s -> s.getArtists().remove(existing));
            existing.getSongs().clear();
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                existing.getSongs().add(s);
                s.getArtists().add(existing);
            }
        }
        if (req.getAlbumIds() != null) {
            existing.getAlbums().forEach(a -> a.getArtists().remove(existing));
            existing.getAlbums().clear();
            for (Long aid : req.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                existing.getAlbums().add(a);
                a.getArtists().add(existing);
            }
        }

        artistRepository.save(existing);
        return findById(existing.getId());
    }

    @Transactional
    public void deleteArtist(Long id) {
        Artist ar = artistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + id));

        ar.getSongs().forEach(s -> s.getArtists().remove(ar));
        ar.getSongs().clear();

        ar.getAlbums().forEach(a -> a.getArtists().remove(ar));
        ar.getAlbums().clear();

        artistRepository.delete(ar);
    }


    private List<ArtistResponseDto> assembleDtos(List<ArtistBaseRow> base) {
        if (base == null || base.isEmpty()) return List.of();

        var ids = base.stream().map(ArtistBaseRow::getId).toList();

        Map<Long, LinkedHashSet<SongPartialDto>> songsByArtist =
                artistRepository.findSongsForArtists(ids).stream()
                        .collect(groupingBy(ArtistSongRow::getArtistId, mapping(sr ->
                                new SongPartialDto(
                                        sr.getId(),
                                        sr.getName(),
                                        "/images/song/" + sr.getId(),
                                        "/song/audio-file/" + sr.getId(),
                                        sr.getLink(),
                                        sr.getYear()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, LinkedHashSet<AlbumPartialDto>> albumsByArtist =
                artistRepository.findAlbumsForArtists(ids).stream()
                        .collect(groupingBy(ArtistAlbumRow::getArtistId, mapping(ar ->
                                new AlbumPartialDto(
                                        ar.getId(),
                                        ar.getName(),
                                        "/images/album/" + ar.getId(),
                                        ar.getLink(),
                                        ar.getYear()
                                ), toCollection(LinkedHashSet::new))));

        List<ArtistResponseDto> out = new ArrayList<>(base.size());
        for (var row : base) {
            Long id = row.getId();
            out.add(new ArtistResponseDto(
                    id,
                    row.getName(),
                    "/images/artist/" + id,
                    row.getDescription(),
                    emptyToNull(albumsByArtist.get(id)),
                    emptyToNull(songsByArtist.get(id))
            ));
        }
        return out;
    }

    private static <T> Set<T> emptyToNull(Set<T> set) {
        return (set == null || set.isEmpty()) ? null : set;
    }
}
