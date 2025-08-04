package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AuthorRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AuthorRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@AllArgsConstructor
public class AuthorService {

    final AuthorRepository authorRepository;
    final SongRepository songRepository;
    final AlbumRepository albumRepository;

    public Author findById(long id) {
        return authorRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public Set<Author> findAll() {
        return Set.copyOf(authorRepository.findAll());
    }

    public Author createAuthor(AuthorRequestDto dto) {
        Author author = new Author();
        author.setName(dto.getName());
        author.setDescription(dto.getDescription());
        if (dto.getImage() != null) {
            author.setImage(dto.getImage());
        }

        if (dto.getSongIds() != null && !dto.getSongIds().isEmpty()) {
            for (Long sid : dto.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                author.getSongs().add(s);
                s.getAuthors().add(author);
            }
        }

        if (dto.getAlbumIds() != null && !dto.getAlbumIds().isEmpty()) {
            for (Long aid : dto.getAlbumIds()) {
                Album a = albumRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + aid));
                author.getAlbums().add(a);
                a.getAuthors().add(author);
            }
        }

        return authorRepository.save(author);
    }

    public Author updateAuthor(Author authorRequest) {
        if (authorRequest.getId() == null) {
            throw new IllegalArgumentException("Author ID is required for update");
        }
        Author existing = authorRepository.findById(authorRequest.getId())
                .orElseThrow(() -> new IllegalArgumentException("Author not found: " + authorRequest.getId()));

        if (authorRequest.getName() != null) existing.setName(authorRequest.getName());
        if (authorRequest.getDescription() != null) existing.setDescription(authorRequest.getDescription());
        if (authorRequest.getImage() != null) existing.setImage(authorRequest.getImage());

        if (authorRequest.getSongs() != null) {
            for (Song s : existing.getSongs()) {
                s.getAuthors().remove(existing);
            }
            existing.getSongs().clear();
            for (Song reqSong : authorRequest.getSongs()) {
                if (reqSong.getId() == null) continue;
                Song s = songRepository.findById(reqSong.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + reqSong.getId()));
                existing.getSongs().add(s);
                s.getAuthors().add(existing);
            }
        }

        if (authorRequest.getAlbums() != null) {
            for (Album a : existing.getAlbums()) {
                a.getAuthors().remove(existing);
            }
            existing.getAlbums().clear();
            for (Album reqAlbum : authorRequest.getAlbums()) {
                if (reqAlbum.getId() == null) continue;
                Album a = albumRepository.findById(reqAlbum.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Album not found: " + reqAlbum.getId()));
                existing.getAlbums().add(a);
                a.getAuthors().add(existing);
            }
        }

        return authorRepository.save(existing);
    }

    public void deleteAuthor(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Author not found: " + id));

        // detach from songs
        for (Song s : author.getSongs()) {
            s.getAuthors().remove(author);
        }
        author.getSongs().clear();

        // detach from albums
        for (Album a : author.getAlbums()) {
            a.getAuthors().remove(author);
        }
        author.getAlbums().clear();

        authorRepository.delete(author);
    }

}
