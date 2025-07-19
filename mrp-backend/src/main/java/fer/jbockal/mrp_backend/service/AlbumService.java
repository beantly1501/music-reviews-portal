package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.AlbumRequestDto;
import fer.jbockal.mrp_backend.model.Album;
import fer.jbockal.mrp_backend.repository.AlbumRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;

    public Album createAlbum(AlbumRequestDto albumRequest) {
        Album album = new Album(albumRequest.getName(), null, null, albumRequest.getYear());
        return albumRepository.save(album);
    }

    public Album updateAlbum(Album albumRequest) {
        albumRepository.findById(albumRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Album not found"));

        return albumRepository.save(albumRequest);
    }
}
