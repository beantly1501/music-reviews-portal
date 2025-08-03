package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AuthorRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class SongService {

    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final AuthorRepository authorRepository;

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Page<Song> getNewestSongs(int limit) {
        return songRepository.findNewest(limit);
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
            s.setCover(Base64.getEncoder().encodeToString(songRequest.getCover()));
        }

        if (songRequest.getLink() != null) {
            s.setLink(songRequest.getLink());
        }

        if (songRequest.getFile() != null) {
            s.setFile(Base64.getEncoder().encodeToString(songRequest.getFile()));
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

        return songRepository.save(s);
    }

    public Song updateSong(Song songRequest) {
        songRepository.findById(songRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));

        return songRepository.save(songRequest);
    }

    public void deleteSong(Long id) {
        songRepository.deleteById(id);
    }
}
