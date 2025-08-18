package fer.jbockal.mrp_backend.repository.projection;

public interface SongAverageProjection {
    Long getSongId();
    Double getAverage();
    Long getCount();
}