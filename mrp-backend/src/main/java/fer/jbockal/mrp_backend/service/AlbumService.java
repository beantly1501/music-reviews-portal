package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AuthorRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final AuthorRepository authorRepository;

    public Album findById(long id) {
        return albumRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public Album createAlbum(AlbumRequestDto dto) {
        Album a = new Album();
        a.setName(dto.getName());
        a.setYear(dto.getYear());
        a.setCover(dto.getCover());

        if (dto.getSongIds() != null && !dto.getSongIds().isEmpty()) {
            for (Long sid : dto.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                a.getSongs().add(s);
                s.getAlbums().add(a);
            }
        }

        return albumRepository.save(a);
    }

    public Album updateAlbum(Album albumRequest) {
        if (albumRequest.getId() == null) {
            throw new IllegalArgumentException("Album ID is required for update");
        }
        Album existing = albumRepository.findById(albumRequest.getId())
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumRequest.getId()));

        if (albumRequest.getName() != null) existing.setName(albumRequest.getName());
        if (albumRequest.getYear() != null) existing.setYear(albumRequest.getYear());
        if (albumRequest.getCover() != null) existing.setCover(albumRequest.getCover());

        // songs: if provided (non-null), replace
        if (albumRequest.getSongs() != null) {
            // detach existing
            for (Song s : existing.getSongs()) {
                s.getAlbums().remove(existing);
            }
            existing.getSongs().clear();
            // attach from request (expecting they have IDs)
            for (Song reqSong : albumRequest.getSongs()) {
                if (reqSong.getId() == null) continue; // skip malformed
                Song s = songRepository.findById(reqSong.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + reqSong.getId()));
                existing.getSongs().add(s);
                s.getAlbums().add(existing);
            }
        }

        if (albumRequest.getAuthors() != null) {
            for (Author a : existing.getAuthors()) {
                a.getAlbums().remove(existing);
            }
            existing.getAuthors().clear();
            for (Author reqAuthor : albumRequest.getAuthors()) {
                if (reqAuthor.getId() == null) continue;
                Author author = authorRepository.findById(reqAuthor.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Author not found: " + reqAuthor.getId()));
                existing.getAuthors().add(author);
                author.getAlbums().add(existing);
            }
        }

        return albumRepository.save(existing);
    }

    public void deleteAlbum(Long id) {
        albumRepository.deleteById(id);
    }
}
