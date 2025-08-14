package fer.jbockal.mrp_backend.repository.projection;

public interface PlaylistRow {
    Long getId();

    String getName();

    String getImage();

    String getDescription();

    boolean getIsPrivate();

    Long getOwnerId();

    String getOwnerUsername();

    Integer getSongsCount();

    Integer getCollaboratorsCount();
}
