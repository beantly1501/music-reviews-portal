package fer.jbockal.mrp_backend.service;

import fer.jbockal.mrp_backend.dto.SongRequestDto;
import fer.jbockal.mrp_backend.model.Song;
import fer.jbockal.mrp_backend.repository.SongRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SongService {

    private final SongRepository songRepository;

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Song createSong(SongRequestDto songRequest){
        Song  song = new Song(songRequest.getName(), songRequest.getCover(), songRequest.getLink(), songRequest.getFile(), songRequest.getYear());
        return songRepository.save(song);
    }

    public Song updateSong(Song songRequest) {
        songRepository.findById(songRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));

        return songRepository.save(songRequest);
    }
}
