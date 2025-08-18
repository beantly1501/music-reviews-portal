package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.GenrePartialDto;
import fer.jbockal.mrp_backend.dto.song.SongRequestDto;
import fer.jbockal.mrp_backend.dto.song.SongResponseDto;
import fer.jbockal.mrp_backend.model.*;
import fer.jbockal.mrp_backend.repository.*;
import fer.jbockal.mrp_backend.repository.projection.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import static java.util.stream.Collectors.*;

@Service
@AllArgsConstructor
public class SongService {

    private final SongRepository songRepository;
    private final SongReviewRepository songReviewRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final GenreRepository genreRepository;
    private final PlaylistRepository playlistRepository;


    @Transactional(readOnly = true)
    public List<SongResponseDto> getAllSongsWithReviewed(AppUser user) {
        var base = songRepository.findAllBase();
        return assembleDtos(base, user);
    }


    @Transactional(readOnly = true)
    public SongResponseDto findById(Long id, AppUser user) {
        SongRow row = songRepository.findBaseById(id);
        if (row == null) {
            throw new IllegalArgumentException("Song not found: " + id);
        }
        return assembleDtos(List.of(row), user).get(0);
    }


    @Transactional(readOnly = true)
    public byte[] getSongImage(Long id) {
        return songRepository.findCoverById(id);
    }

    @Transactional(readOnly = true)
    public byte[] getSongFile(Long id) {
        return songRepository.findFileById(id);
    }


    @Transactional
    public SongResponseDto createSong(SongRequestDto req, AppUser user) {
        Song s = new Song();
        s.setName(req.getName());
        s.setYear(req.getYear());
        s.setLink(req.getLink());
        if (req.getCover() != null) s.setCover(req.getCover());
        if (req.getFile() != null) s.setFile(req.getFile());

        if (req.getAlbumIds() != null) {
            for (Long aid : req.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                s.getAlbums().add(a);
                a.getSongs().add(s);
            }
        }
        if (req.getArtistIds() != null) {
            for (Long arid : req.getArtistIds()) {
                Artist ar = artistRepository.findById(arid)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + arid));
                s.getArtists().add(ar);
                ar.getSongs().add(s);
            }
        }
        if (req.getGenreIds() != null) {
            for (Long gid : req.getGenreIds()) {
                Genre g = genreRepository.findById(gid)
                        .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + gid));
                s.getGenres().add(g);
                g.getSongs().add(s);
            }
        }

        Song saved = songRepository.save(s);
        return findById(saved.getId(), user);
    }

    @Transactional
    public SongResponseDto updateSong(Long id, SongRequestDto req, AppUser user) {
        Song existing = songRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getYear() != null) existing.setYear(req.getYear());
        if (req.getLink() != null) existing.setLink(req.getLink());
        if (req.getCover() != null) existing.setCover(req.getCover());
        if (req.getFile() != null) existing.setFile(req.getFile());

        if (req.getAlbumIds() != null) {
            existing.getAlbums().forEach(a -> a.getSongs().remove(existing));
            existing.getAlbums().clear();
            for (Long aid : req.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                existing.getAlbums().add(a);
                a.getSongs().add(existing);
            }
        }
        if (req.getArtistIds() != null) {
            existing.getArtists().forEach(ar -> ar.getSongs().remove(existing));
            existing.getArtists().clear();
            for (Long arid : req.getArtistIds()) {
                Artist ar = artistRepository.findById(arid)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + arid));
                existing.getArtists().add(ar);
                ar.getSongs().add(existing);
            }
        }
        if (req.getGenreIds() != null) {
            existing.getGenres().forEach(g -> g.getSongs().remove(existing));
            existing.getGenres().clear();
            for (Long gid : req.getGenreIds()) {
                Genre g = genreRepository.findById(gid)
                        .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + gid));
                existing.getGenres().add(g);
                g.getSongs().add(existing);
            }
        }

        songRepository.save(existing);
        return findById(existing.getId(), user);
    }

    @Transactional
    public void deleteSong(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        playlistRepository.unlinkSongFromAllPlaylists(id);
        songReviewRepository.deleteReviewsBecauseOfDeletedSong(id);

        song.getAlbums().forEach(a -> a.getSongs().remove(song));
        song.getAlbums().clear();

        song.getArtists().forEach(ar -> ar.getSongs().remove(song));
        song.getArtists().clear();

        song.getGenres().forEach(g -> g.getSongs().remove(song));
        song.getGenres().clear();

        songRepository.delete(song);
    }


    private List<SongResponseDto> assembleDtos(List<SongRow> base, AppUser userForGrades) {
        if (base == null || base.isEmpty()) return List.of();

        var ids = base.stream().map(SongRow::getId).toList();

        Map<Long, LinkedHashSet<AlbumPartialDto>> albumsBySong =
                songRepository.findAlbumsForSongs(ids).stream()
                        .collect(groupingBy(AlbumForSongRow::getSongId, mapping(ar ->
                                new AlbumPartialDto(
                                        ar.getId(),
                                        ar.getName(),
                                        "/images/album/" + ar.getId(),
                                        ar.getLink(),
                                        ar.getYear()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, LinkedHashSet<ArtistPartialDto>> artistsBySong =
                songRepository.findArtistsForSongs(ids).stream()
                        .collect(groupingBy(ArtistRow::getSongId, mapping(ar ->
                                new ArtistPartialDto(
                                        ar.getId(),
                                        ar.getName(),
                                        "/images/artist/" + ar.getId(),
                                        ar.getDescription()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, LinkedHashSet<GenrePartialDto>> genresBySong =
                songRepository.findGenresForSongs(ids).stream()
                        .collect(groupingBy(GenreRow::getSongId, mapping(gr ->
                                new GenrePartialDto(
                                        gr.getId(),
                                        gr.getName()
                                ), toCollection(LinkedHashSet::new))));

        Map<Long, Integer> gradesBySongId = Collections.emptyMap();
        if (userForGrades != null) {
            gradesBySongId = songReviewRepository.findByUser(userForGrades).stream()
                    .collect(toMap(sr -> sr.getSong().getId(), SongReview::getGrade));
        }

        Map<Long, BigDecimal> avgBySongId =
                songReviewRepository.findAveragesForSongs(ids).stream()
                        .collect(toMap(
                                SongAverageProjection::getSongId,
                                p -> {
                                    Double avg = p.getAverage();
                                    return (avg == null)
                                            ? null
                                            : BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);
                                }
                        ));

        List<SongResponseDto> out = new ArrayList<>(base.size());
        for (var s : base) {
            Long id = s.getId();
            out.add(new SongResponseDto(
                    id,
                    s.getName(),
                    "/images/song/" + id,      // imageUrl
                    "/song/audio-file/" + id,  // fileUrl (stream on demand)
                    s.getLink(),
                    s.getYear(),
                    emptyToNull(albumsBySong.get(id)),
                    emptyToNull(artistsBySong.get(id)),
                    emptyToNull(genresBySong.get(id)),
                    gradesBySongId.get(id),
                    avgBySongId.get(id)        // averageRating
            ));
        }
        return out;
    }

    private static <T> Set<T> emptyToNull(Set<T> set) {
        return (set == null || set.isEmpty()) ? null : set;
    }
}
