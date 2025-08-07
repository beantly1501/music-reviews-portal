package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.dto.SongResponseDto;
import fer.jbockal.mrp_backend.dto.partial.AlbumPartialDto;
import fer.jbockal.mrp_backend.dto.partial.ArtistPartialDto;
import fer.jbockal.mrp_backend.dto.partial.GenrePartialDto;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Artist;
import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.repository.SongRepository;
import fer.jbockal.mrp_backend.repository.SongReviewRepository;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.ArtistRepository;
import fer.jbockal.mrp_backend.repository.GenreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SongService {

    private final SongRepository songRepository;
    private final SongReviewRepository songReviewRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final GenreRepository genreRepository;

    /**
     * Retrieve all songs with the current user's review status and grade.
     */
    public List<SongResponseDto> getAllSongsWithReviewed(AppUser user) {
        List<Song> songs = songRepository.findAll();

        Map<Long, Integer> gradesBySongId = songReviewRepository
                .findByUser(user)
                .stream()
                .collect(Collectors.toMap(
                        sr -> sr.getSong().getId(),
                        sr -> sr.getGrade()
                ));

        return songs.stream()
                .map(song -> toDto(song, gradesBySongId.get(song.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Search songs by name fragment (case-insensitive).
     */
    public List<SongResponseDto> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return songRepository
                .findByNameContainingIgnoreCase(fragment)
                .stream()
                .map(song -> toDto(song, null))
                .collect(Collectors.toList());
    }

    /**
     * Find a single song by its ID and map to DTO.
     */
    public SongResponseDto findById(long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Song not found: " + id));
        return toDto(song, null);
    }

    /**
     * Return raw audio file bytes for streaming.
     */
    public byte[] getSongFile(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Song not found: " + id));
        return song.getFile();
    }

    /**
     * Create a new song and map to DTO.
     */
    public SongResponseDto createSong(SongRequestDto songRequest) {
        Song s = new Song();
        s.setName(songRequest.getName());
        if (songRequest.getYear() != null) {
            s.setYear(songRequest.getYear());
        }
        if (songRequest.getCover() != null) {
            s.setCover(songRequest.getCover());
        }
        if (songRequest.getLink() != null) {
            s.setLink(songRequest.getLink());
        }
        if (songRequest.getFile() != null) {
            s.setFile(songRequest.getFile());
        }

        if (songRequest.getAlbumIds() != null) {
            for (Long aid : songRequest.getAlbumIds()) {
                Album album = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                s.getAlbums().add(album);
                album.getSongs().add(s);
            }
        }
        if (songRequest.getArtistIds() != null) {
            for (Long authId : songRequest.getArtistIds()) {
                Artist artist = artistRepository.findById(authId)
                        .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + authId));
                s.getArtists().add(artist);
                artist.getSongs().add(s);
            }
        }
        if (songRequest.getGenreIds() != null) {
            for (Long gid : songRequest.getGenreIds()) {
                Genre genre = genreRepository.findById(gid)
                        .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + gid));
                s.getGenres().add(genre);
                genre.getSongs().add(s);
            }
        }

        Song saved = songRepository.save(s);
        return toDto(saved, null);
    }

    /**
     * Update an existing song and map to DTO.
     */
    public SongResponseDto updateSong(Song songRequest) {
        Song existing = songRepository.findById(songRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Song not found: " + songRequest.getId()));

        // update fields
        existing.setName(songRequest.getName());
        existing.setYear(songRequest.getYear());
        existing.setLink(songRequest.getLink());
        existing.setCover(songRequest.getCover());
        existing.setFile(songRequest.getFile());

        // detach old relations
        existing.getAlbums().forEach(a -> a.getSongs().remove(existing));
        existing.getAlbums().clear();
        existing.getArtists().forEach(ar -> ar.getSongs().remove(existing));
        existing.getArtists().clear();
        existing.getGenres().forEach(g -> g.getSongs().remove(existing));
        existing.getGenres().clear();

        // attach new relations from passed Song
        for (Album albumRef : songRequest.getAlbums()) {
            Album album = albumRepository.findById(albumRef.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumRef.getId()));
            existing.getAlbums().add(album);
            album.getSongs().add(existing);
        }
        for (Artist artistRef : songRequest.getArtists()) {
            Artist artist = artistRepository.findById(artistRef.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Artist not found: " + artistRef.getId()));
            existing.getArtists().add(artist);
            artist.getSongs().add(existing);
        }
        for (Genre genreRef : songRequest.getGenres()) {
            Genre genre = genreRepository.findById(genreRef.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Genre not found: " + genreRef.getId()));
            existing.getGenres().add(genre);
            genre.getSongs().add(existing);
        }

        Song updated = songRepository.save(existing);
        return toDto(updated, null);
    }

    /**
     * Delete a song by ID, cleaning up bidirectional links.
     */
    public void deleteSong(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        song.getAlbums().forEach(a -> a.getSongs().remove(song));
        song.getAlbums().clear();

        song.getArtists().forEach(ar -> ar.getSongs().remove(song));
        song.getArtists().clear();

        song.getGenres().forEach(g -> g.getSongs().remove(song));
        song.getGenres().clear();

        songRepository.delete(song);
    }

    /**
     * Map a Song entity to a SongResponseDto.
     */
    private SongResponseDto toDto(Song song, Integer grade) {
        boolean reviewed = grade != null;

        Set<AlbumPartialDto> albumDtos = song.getAlbums().stream()
                .map(a -> new AlbumPartialDto(a.getId(), a.getName(), a.getCover(), a.getLink(), a.getYear()))
                .collect(Collectors.toSet());
        Set<ArtistPartialDto> artistDtos = song.getArtists().stream()
                .map(ar -> new ArtistPartialDto(ar.getId(), ar.getName(), ar.getImage(), ar.getDescription()))
                .collect(Collectors.toSet());
        Set<GenrePartialDto> genreDtos = song.getGenres().stream()
                .map(g -> new GenrePartialDto(g.getId(), g.getName()))
                .collect(Collectors.toSet());

        albumDtos = albumDtos.isEmpty() ? null : albumDtos;
        artistDtos = artistDtos.isEmpty() ? null : artistDtos;
        genreDtos = genreDtos.isEmpty() ? null : genreDtos;

        return new SongResponseDto(
                song.getId(),
                song.getName(),
                song.getCover(),
                song.getLink(),
                song.getFile(),
                song.getYear(),
                albumDtos,
                artistDtos,
                genreDtos,
                reviewed,
                grade
        );
    }
}
