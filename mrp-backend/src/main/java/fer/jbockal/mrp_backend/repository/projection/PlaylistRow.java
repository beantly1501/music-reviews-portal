package fer.jbockal.mrp_backend.repository.projection;

public interface PlaylistRow {
    Long getId();

    String getName();

    String getImage();

    String getDescription();

    boolean getIsPrivate();

    String getOwnerUsername();

    Integer getSongsCount();

    Integer getCollaboratorsCount();
}
