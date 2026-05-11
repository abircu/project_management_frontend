import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import api from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectFormDialog from '@/components/ProjectFormDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

const statusVariant = {
  pending: 'warning',
  active: 'success',
  completed: 'info',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = useCallback(async () => {
    setError(null);
    setProject(null);
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      setError('Invalid project id');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${numericId}`);
      setProject(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load';
      setError(msg);
      if (err.response?.status === 404) setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to projects
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-2 min-w-0">
            <p className="text-xs text-muted-foreground font-mono">ID #{project.id}</p>
            <CardTitle className="text-2xl break-words">{project.name}</CardTitle>
            <Badge variant={statusVariant[project.status] || 'secondary'}>{project.status}</Badge>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Description</div>
            {project.description ? (
              <p className="text-sm whitespace-pre-wrap">{project.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Start date</div>
              <div className="font-medium">
                {project.start_date ? project.start_date.slice(0, 10) : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">End date</div>
              <div className="font-medium">
                {project.end_date ? project.end_date.slice(0, 10) : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">
                {project.created_at ? new Date(project.created_at).toLocaleString() : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Updated</div>
              <div className="font-medium">
                {project.updated_at ? new Date(project.updated_at).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        onSaved={fetchProject}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project?"
        description={`"${project.name}" will be permanently deleted.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
