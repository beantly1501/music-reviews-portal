package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.album.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.album.AlbumResponseDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.GenrePartialDto;
import fer.jbockal.mrp_backend.dto.partial.SongPartialDto;
import fer.jbockal.mrp_backend.model.*;
import fer.jbockal.mrp_backend.repository.*;
import fer.jbockal.mrp_backend.repository.projection.AlbumGenreRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumSongRow;
import fer.jbockal.mrp_backend.repository.projection.AlbumArtistRow;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.*;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumReviewRepository albumReviewRepository;

    public AlbumService(
            AlbumRepository albumRepository,
            SongRepository songRepository,
            ArtistRepository artistRepository,
            AlbumReviewRepository albumReviewRepository
    ) {
        this.albumRepository = albumRepository;
        this.songRepository = songRepository;
        this.artistRepository = artistRepository;
        this.albumReviewRepository = albumReviewRepository;
    }

    // -------------- READ --------------

    @Transactional(readOnly = true)
    public List<AlbumResponseDto> getAllAlbumsWithReviewed(AppUser user) {
        var base = albumRepository.findAllBase();
        return assembleDtos(base, user);
    }

    @Transactional(readOnly = true)
    public List<AlbumResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) return List.of();
        var base = albumRepository.findBaseByNameFragment(fragment);
        return assembleDtos(base, null); // pass user if you want grades on search, too
    }

    @Transactional(readOnly = true)
    public AlbumResponseDto findById(Long id, AppUser user) {
        AlbumRow row = albumRepository.findBaseById(id);
        if (row == null) throw new IllegalArgumentException("Album not found: " + id);
        return assembleDtos(List.of(row), user).get(0);
    }

    @Transactional(readOnly = true)
    public byte[] getAlbumImage(Long id) {
        byte[] bytes = albumRepository.findCoverById(id);
        if (bytes == null) throw new IllegalArgumentException("Image not found for album: " + id);
        return bytes;
    }

    // -------------- WRITE --------------

    @Transactional
    public AlbumResponseDto createAlbum(AlbumRequestDto req, AppUser user) {
        Album a = new Album();
        a.setName(req.getName());
        a.setYear(req.getYear());
        a.setLink(req.getLink());
        if (req.getCover() != null) a.setCover(req.getCover());

        if (req.getSongIds() != null) {
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                a.getSongs().add(s);
                s.getAlbums().add(a);
            }
        }
        if (req.getArtistIds() != null) {
            for (Long arid : req.getArtistIds()) {
                Artist ar = artistRepository.findById(arid)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + arid));
                a.getArtists().add(ar);
                ar.getAlbums().add(a);
            }
        }

        Album saved = albumRepository.save(a);
        return findById(saved.getId(), user);
    }

    @Transactional
    public AlbumResponseDto updateAlbum(Long id, AlbumRequestDto req, AppUser user) {
        Album existing = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getYear() != null) existing.setYear(req.getYear());
        if (req.getLink() != null) existing.setLink(req.getLink());
        if (req.getCover() != null) existing.setCover(req.getCover());

        if (req.getSongIds() != null) {
            existing.getSongs().forEach(s -> s.getAlbums().remove(existing));
            existing.getSongs().clear();
            for (Long sid : req.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                existing.getSongs().add(s);
                s.getAlbums().add(existing);
            }
        }
        if (req.getArtistIds() != null) {
            existing.getArtists().forEach(ar -> ar.getAlbums().remove(existing));
            existing.getArtists().clear();
            for (Long arid : req.getArtistIds()) {
                Artist ar = artistRepository.findById(arid)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + arid));
                existing.getArtists().add(ar);
                ar.getAlbums().add(existing);
            }
        }

        albumRepository.save(existing);
        return findById(existing.getId(), user);
    }

    @Transactional
    public void deleteAlbum(Long id) {
        Album a = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));

        albumReviewRepository.deleteReviewsBecauseOfDeletedAlbum(id);

        a.getSongs().forEach(s -> s.getAlbums().remove(a));
        a.getSongs().clear();

        a.getArtists().forEach(ar -> ar.getAlbums().remove(a));
        a.getArtists().clear();

        albumRepository.delete(a);
    }

    // -------------- DTO assembly --------------

    private List<AlbumResponseDto> assembleDtos(List<AlbumRow> base, AppUser user) {
        if (base == null || base.isEmpty()) return List.of();

        var ids = base.stream().map(AlbumRow::getId).toList();

        Map<Long, LinkedHashSet<SongPartialDto>> songsByAlbum =
                albumRepository.findSongsForAlbums(ids).stream()
                        .collect(groupingBy(AlbumSongRow::getAlbumId, mapping(sr ->
                                new SongPartialDto(
                                        sr.getId(),
                                        sr.getName(),
                                        "/images/song/" + sr.getId(),
                                        "/song/audio-file/" + sr.getId(),
                                        sr.getLink(),
                                        sr.getYear()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, LinkedHashSet<ArtistPartialDto>> artistsByAlbum =
                albumRepository.findArtistsForAlbums(ids).stream()
                        .collect(groupingBy(AlbumArtistRow::getAlbumId, mapping(ar ->
                                new ArtistPartialDto(
                                        ar.getId(),
                                        ar.getName(),
                                        "/images/artist/" + ar.getId(),
                                        ar.getDescription()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, LinkedHashSet<GenrePartialDto>> genresByAlbum =
                albumRepository.findGenresForAlbums(ids).stream()
                        .collect(groupingBy(AlbumGenreRow::getAlbumId, mapping(gr ->
                                        new GenrePartialDto(gr.getId(), gr.getName()),
                                toCollection(LinkedHashSet::new))));

        Map<Long, Integer> gradesByAlbumId = Collections.emptyMap();
        if (user != null) {
            gradesByAlbumId = albumReviewRepository.findByUser(user).stream()
                    .collect(toMap(ar -> ar.getAlbum().getId(), AlbumReview::getGrade));
        }

        List<AlbumResponseDto> out = new ArrayList<>(base.size());
        for (var row : base) {
            Long id = row.getId();
            out.add(new AlbumResponseDto(
                    id,
                    row.getName(),
                    "/images/album/" + id,
                    row.getLink(),
                    row.getYear(),
                    emptyToNull(songsByAlbum.get(id)),
                    emptyToNull(artistsByAlbum.get(id)),
                    emptyToNull(genresByAlbum.get(id)),
                    gradesByAlbumId.get(id)
            ));
        }
        return out;
    }

    private static <T> Set<T> emptyToNull(Set<T> set) {
        return (set == null || set.isEmpty()) ? null : set;
    }
}
