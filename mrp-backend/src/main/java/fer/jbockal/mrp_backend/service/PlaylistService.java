package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.PlaylistRequestDto;
import fer.jbockal.mrp_backend.model.Playlist;
import fer.jbockal.mrp_backend.repository.PlaylistRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;

    public Playlist createPlaylist(PlaylistRequestDto playlistRequest){
        Playlist  playlist = new Playlist();
        return playlistRepository.save(playlist);
    }
}
