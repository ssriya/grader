import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { loadDB, saveDB, generateId, StudyMaterial } from '@/lib/db';
import { toast } from 'sonner';

interface StudyMaterialsTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function StudyMaterialsTab({ classId, onRefresh }: StudyMaterialsTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const db = loadDB();
  const materials = db.studyMaterials.filter(m => m.classId === classId);

  const handleAddMaterial = () => {
    if (!title || !url) {
      toast.error('Please fill all required fields');
      return;
    }

    const db = loadDB();
    const newMaterial: StudyMaterial = {
      id: generateId('sm'),
      classId,
      title,
      description,
      url,
      uploadDate: new Date().toISOString(),
    };

    db.studyMaterials.push(newMaterial);
    saveDB(db);
    setTitle('');
    setDescription('');
    setUrl('');
    setIsDialogOpen(false);
    onRefresh();
    toast.success('Study material added');
  };

  const handleDeleteMaterial = (materialId: string) => {
    const db = loadDB();
    db.studyMaterials = db.studyMaterials.filter(m => m.id !== materialId);
    saveDB(db);
    onRefresh();
    toast.success('Study material deleted');
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Study Materials</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Study Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="material-title">Title</Label>
                <Input
                  id="material-title"
                  placeholder="e.g., Chapter 1 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-description">Description</Label>
                <Textarea
                  id="material-description"
                  placeholder="Brief description of the material"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-url">URL or File Link</Label>
                <Input
                  id="material-url"
                  type="url"
                  placeholder="https://example.com/notes.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleAddMaterial} className="w-full">
                Add Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No study materials added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map(material => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{material.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                        </p>
                        <a 
                          href={material.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View Link
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
