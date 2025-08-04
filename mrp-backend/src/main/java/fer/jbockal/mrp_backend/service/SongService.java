package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Genre;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AuthorRepository;
import fer.jbockal.mrp_backend.repository.GenreRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SongService {

    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public List<Song> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return songRepository.findByNameContainingIgnoreCase(fragment);
    }

    public Song findById(long id) {
        return songRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public Song createSong(SongRequestDto songRequest) {
        Song s = new Song();
        s.setName(songRequest.getName());

        if (songRequest.getYear() != null) {
            s.setYear(songRequest.getYear());
        }

        if (songRequest.getCover() != null) {
            s.setCover(songRequest.getCover()); // raw bytes
        }

        if (songRequest.getLink() != null) {
            s.setLink(songRequest.getLink());
        }

        if (songRequest.getCover() != null) {
            s.setFile(songRequest.getFile()); // raw bytes
        }

        // link albums if provided
        if (songRequest.getAlbumIds() != null) {
            for (Long aid : songRequest.getAlbumIds()) {
                Album album = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                s.getAlbums().add(album);
                album.getSongs().add(s);
            }
        }

        // link authors if provided
        if (songRequest.getAuthorIds() != null) {
            for (Long authId : songRequest.getAuthorIds()) {
                Author author = authorRepository.findById(authId)
                        .orElseThrow(() -> new IllegalArgumentException("Author not found: " + authId));
                s.getAuthors().add(author);
                author.getSongs().add(s);
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

        return songRepository.save(s);
    }

    public Song updateSong(Song songRequest) {
        songRepository.findById(songRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));

        return songRepository.save(songRequest);
    }

    public void deleteSong(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Song not found: " + id));

        // detach from albums
        for (Album a : song.getAlbums()) {
            a.getSongs().remove(song);
        }
        song.getAlbums().clear();

        // detach from authors
        for (Author auth : song.getAuthors()) {
            auth.getSongs().remove(song);
        }
        song.getAuthors().clear();

        // detach from genres
        for (Genre g : song.getGenres()) {
            g.getSongs().remove(song);
        }
        song.getGenres().clear();

        songRepository.delete(song);
    }

}
