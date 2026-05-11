import { useEffect, useState } from 'react';
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

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-8 text-destructive">{error}</div>;
  if (!project) return <div className="p-8 text-muted-foreground">Project not found.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to projects
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{project.name}</CardTitle>
            <Badge variant={statusVariant[project.status] || 'secondary'}>
              {project.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 /> Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Description</div>
            <p className="text-sm whitespace-pre-wrap">
              {project.description || <span className="text-muted-foreground">No description</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Start Date</div>
              <div className="font-medium">
                {project.start_date ? project.start_date.slice(0, 10) : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">End Date</div>
              <div className="font-medium">
                {project.end_date ? project.end_date.slice(0, 10) : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">
                {project.created_at ? new Date(project.created_at).toLocaleDateString() : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Updated</div>
              <div className="font-medium">
                {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '—'}
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
