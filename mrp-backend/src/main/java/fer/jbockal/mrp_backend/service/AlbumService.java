package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.dto.AlbumResponseDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.model.AppUser;
import fer.jbockal.mrp_backend.model.Author;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import fer.jbockal.mrp_backend.repository.AlbumReviewRepository;
import fer.jbockal.mrp_backend.repository.AuthorRepository;
import fer.jbockal.mrp_backend.repository.SongRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final AuthorRepository authorRepository;
    private final AlbumReviewRepository albumReviewRepository;

    public List<Album> searchByNameFragment(String fragment) {
        if (fragment == null || fragment.isBlank()) {
            return List.of();
        }
        return albumRepository.findByNameContainingIgnoreCase(fragment);
    }

    public List<AlbumResponseDto> getAllAlbumsWithReviewed(AppUser user) {
        List<Album> albums = albumRepository.findAll();

        Set<Long> reviewedAlbumIds = albumReviewRepository.findByUser(user)
                .stream()
                .map(ar -> ar.getAlbum().getId())
                .collect(Collectors.toSet());

        return albums.stream()
                .map(album -> new AlbumResponseDto(
                        album.getId(),
                        album.getName(),
                        album.getCover(),
                        album.getLink(),
                        album.getYear(),
                        album.getSongs(),
                        album.getAuthors(),
                        reviewedAlbumIds.contains(album.getId())
                ))
                .collect(Collectors.toList());
    }

    public Album createAlbum(AlbumRequestDto albumRequest) {
        Album a = new Album();
        a.setName(albumRequest.getName());

        if (albumRequest.getYear() != null) {
            a.setYear(albumRequest.getYear());
        }

        if (albumRequest.getCover() != null) {
            a.setCover(albumRequest.getCover());
        }

        if (albumRequest.getLink() != null) {
            a.setLink(albumRequest.getLink());
        }

        if (albumRequest.getSongIds() != null && !albumRequest.getSongIds().isEmpty()) {
            for (Long sid : albumRequest.getSongIds()) {
                Song s = songRepository.findById(sid)
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + sid));
                a.getSongs().add(s);
                s.getAlbums().add(a);
            }
        }

        if (albumRequest.getAuthorIds() != null && !albumRequest.getAuthorIds().isEmpty()) {
            for (Long aid : albumRequest.getAuthorIds()) {
                Author author = authorRepository.findById(aid)
                        .orElseThrow(() -> new IllegalArgumentException("Author not found: " + aid));
                a.getAuthors().add(author);
                author.getAlbums().add(a);
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
        if (albumRequest.getLink() != null) existing.setLink(albumRequest.getLink());

        // songs: if provided (non-null), replace
        if (albumRequest.getSongs() != null) {
            for (Song s : existing.getSongs()) {
                s.getAlbums().remove(existing);
            }
            existing.getSongs().clear();
            for (Song reqSong : albumRequest.getSongs()) {
                if (reqSong.getId() == null) continue;
                Song s = songRepository.findById(reqSong.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Song not found: " + reqSong.getId()));
                existing.getSongs().add(s);
                s.getAlbums().add(existing);
            }
        }

        // authors: if provided, replace
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
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));

        // detach from songs
        for (Song s : album.getSongs()) {
            s.getAlbums().remove(album);
        }
        album.getSongs().clear();

        // detach from authors
        for (Author a : album.getAuthors()) {
            a.getAlbums().remove(album);
        }
        album.getAuthors().clear();

        albumRepository.delete(album);
    }

}
