import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Upload,
  Save,
  Download,
  Preview,
  Add,
  Delete,
  Edit,
  Visibility,
  Person,
  Event,
  School,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import certificateService from '../../services/certificateService';
import adminApiService from '../../services/adminApiService';

interface CertificateTemplate {
  id: number;
  event_id: number;
  template_name: string;
  template_path: string;
  created_at: string;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  registration_number: string;
  attendance_verified_at: string;
  attendance_status: string;
}

interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'date';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
}

const CertificateBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | ''>('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [organizerName, setOrganizerName] = useState('');
  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const elementsRef = useRef<CertificateElement[]>([]);
  const [realTimePositions, setRealTimePositions] = useState<Record<string, { x: number; y: number }>>({});
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch events with certificates (only events that has_certificate = 1)
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events-with-certificates'],
    queryFn: async () => {
      // Get all events and filter only those with has_certificate = true
      const response = await adminApiService.getAllEvents();
      return {
        data: response.data.filter((event: any) => event.has_certificate === 1 || event.has_certificate === true)
      };
    },
  });

  const events = eventsData?.data || [];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  }, []);

  // Draw elements on canvas
  const drawElements = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (higher resolution for better quality)
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 800;
    const displayHeight = 600;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Scale context for high DPI
    ctx.scale(dpr, dpr);
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw template image if exists
    if (templateImage) {
      ctx.drawImage(templateImage, 0, 0, displayWidth, displayHeight);
    } else {
      // Draw border only if no template
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, displayWidth - 20, displayHeight - 20);
    }

    // Draw elements
    elements.forEach((element) => {
      ctx.save();
      
      // Get real-time position
      const position = getElementPosition(element);
      
      // Set font first to calculate text dimensions
      ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
      const textMetrics = ctx.measureText(element.content);
      const textWidth = textMetrics.width;
      const textHeight = element.fontSize || 16;
      
      // Draw selection highlight if element is selected
      if (element.id === selectedElement) {
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(position.x - 3, position.y - textHeight - 3, textWidth + 6, textHeight + 6);
        ctx.setLineDash([]);
      }
      
      // Draw subtle hover highlight
      if (element.id === hoveredElement && element.id !== selectedElement) {
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(position.x - 3, position.y - textHeight - 3, textWidth + 6, textHeight + 6);
        ctx.setLineDash([]);
      }
      
      ctx.fillStyle = element.color || '#000000';
      ctx.fillText(element.content, position.x, position.y);
      ctx.restore();
    });
  };

  // Update elementsRef whenever elements change
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Get real-time position for element
  const getElementPosition = (element: CertificateElement) => {
    if (realTimePositions[element.id]) {
      return realTimePositions[element.id];
    }
    return { x: element.x, y: element.y };
  };

  // Helper function to get consistent canvas coordinates
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const displayWidth = 800;
    const displayHeight = 600;
    
    return {
      x: (event.clientX - rect.left) * (displayWidth / rect.width),
      y: (event.clientY - rect.top) * (displayHeight / rect.height)
    };
  };

  useEffect(() => {
    drawElements();
  }, [elements, templateImage, selectedElement, hoveredElement]);

  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedEvent) {
      alert('Pilih event terlebih dahulu');
      return;
    }

    try {
      setTemplateFile(file);
      
      // Upload template to server
      await certificateService.uploadTemplate(selectedEvent as number, file, true);
      
      // Load template image for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setTemplateImage(img);
          drawElements();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      alert('Template berhasil diupload!');
    } catch (error: any) {
      console.error('Error uploading template:', error);
      alert('Gagal upload template: ' + (error.response?.data?.message || error.message));
      setTemplateFile(null);
    }
  };

  const addTextElement = () => {
    const newElement: CertificateElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: 'Text Element',
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
    };
    setElements([...elements, newElement]);
  };

  const addDateElement = () => {
    const newElement: CertificateElement = {
      id: `date_${Date.now()}`,
      type: 'date',
      content: '{{DATE}}',
      x: 100,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#666666',
      fontWeight: 'normal',
    };
    setElements([...elements, newElement]);
  };

  const addParticipantElement = () => {
    const newElement: CertificateElement = {
      id: `participant_${Date.now()}`,
      type: 'text',
      content: '{{PARTICIPANT_NAME}}',
      x: 100,
      y: 100,
      width: 300,
      height: 30,
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'bold',
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<CertificateElement>) => {
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    );
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);

    // Find clicked element with precise hit detection (only within selection box)
    const clickedElement = elementsRef.current.find(el => {
      // Calculate actual text dimensions
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      
      ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 16}px ${el.fontFamily || 'Arial'}`;
      const textMetrics = ctx.measureText(el.content);
      const textWidth = textMetrics.width;
      const textHeight = el.fontSize || 16;
      
      // Get real-time position
      const position = getElementPosition(el);
      
      // Hit detection only within the selection box area (blue border) - more precise
      const selectionPadding = 3; // Reduced padding for more precise hit detection
      return x >= (position.x - selectionPadding) && x <= (position.x + textWidth + selectionPadding) &&
             y >= (position.y - textHeight - selectionPadding) && y <= (position.y + selectionPadding);
    });

    if (clickedElement) {
      setSelectedElement(clickedElement.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y
      });
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);

    if (isDragging && selectedElement) {
      // Update real-time position while dragging
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      setRealTimePositions(prev => ({
        ...prev,
        [selectedElement]: { x: newX, y: newY }
      }));
      
      // Update element position while dragging
      updateElement(selectedElement, {
        x: newX,
        y: newY
      });
    } else {
      // Check for hovered element (same precise hit detection)
      const hoveredEl = elementsRef.current.find(el => {
        const canvas = canvasRef.current;
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        
        ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 16}px ${el.fontFamily || 'Arial'}`;
        const textMetrics = ctx.measureText(el.content);
        const textWidth = textMetrics.width;
        const textHeight = el.fontSize || 16;
        
        // Get real-time position
        const position = getElementPosition(el);
        
        // Same precise hit detection as click - more precise
        const selectionPadding = 3; // Reduced padding for more precise hit detection
        return x >= (position.x - selectionPadding) && x <= (position.x + textWidth + selectionPadding) &&
               y >= (position.y - textHeight - selectionPadding) && y <= (position.y + selectionPadding);
      });

      // Throttle hover detection for better performance
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredElement(hoveredEl?.id || null);
      }, 10); // Small delay to prevent excessive updates
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    // Clear real-time positions after drag ends
    setRealTimePositions({});
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };


  const clearTemplate = () => {
    setTemplateFile(null);
    setTemplateImage(null);
    setElements([]);
    setSelectedElement(null);
    // Reset file input
    const fileInput = document.getElementById('template-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Redraw canvas without template
    drawElements();
  };

  const generateCertificates = async () => {
    if (!selectedEvent) {
      alert('Pilih event terlebih dahulu');
      return;
    }

    if (!templateImage) {
      alert('Upload template terlebih dahulu');
      return;
    }

    try {
      setGenerating(true);
      
      // Generate certificates for all attendees automatically
      const response = await certificateService.generateCertificatesForEvent(selectedEvent as number);

      if (response.status === 'success') {
        alert(`Berhasil generate ${response.data.generated} sertifikat untuk semua peserta yang hadir!`);
        
        // Reset form
        setSelectedEvent('');
        setOrganizerName('');
        setElements([]);
        setTemplateImage(null);
        setTemplateFile(null);
        const fileInput = document.getElementById('template-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        alert('Gagal generate sertifikat: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error generating certificates:', error);
      alert('Gagal generate sertifikat: ' + (error.response?.data?.message || error.message));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Certificate Builder
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Buat dan desain sertifikat untuk event dengan canvas editor
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Left Panel - Controls */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event & Template
                </Typography>

                {/* Event Selection - Only show events with certificates */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pilih Event</InputLabel>
                  <Select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value as number)}
                    disabled={eventsLoading}
                  >
                    {eventsLoading ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : events.length === 0 ? (
                      <MenuItem disabled>Tidak ada event dengan sertifikat</MenuItem>
                    ) : (
                      events.map((event: any) => (
                        <MenuItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.date).toLocaleDateString('id-ID')}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption">
                    Hanya menampilkan event yang menggunakan sertifikat
                  </Typography>
                </Alert>

                {/* Template Upload */}
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="template-upload"
                    type="file"
                    onChange={handleTemplateUpload}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <label htmlFor="template-upload" style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Upload />}
                        fullWidth
                        disabled={!!templateImage}
                      >
                        {templateImage ? 'Template Loaded' : 'Upload Template'}
                      </Button>
                    </label>
                    {templateImage && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={clearTemplate}
                        size="small"
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                  {templateImage && (
                    <Typography variant="caption" color="text.secondary">
                      Template loaded successfully
                    </Typography>
                  )}
                </Box>

                {/* Info about selected event */}
                {selectedEvent && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block">
                      <strong>Event dipilih!</strong>
                    </Typography>
                    <Typography variant="caption">
                      Sertifikat akan di-generate untuk <strong>semua peserta yang hadir</strong>
                    </Typography>
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Element Tools */}
                <Typography variant="h6" gutterBottom>
                  Elemen Sertifikat
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addTextElement}
                    fullWidth
                  >
                    Tambah Teks
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={addParticipantElement}
                    fullWidth
                  >
                    Nama Peserta
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Event />}
                    onClick={addDateElement}
                    fullWidth
                  >
                    Tanggal
                  </Button>
                </Box>

                {/* Element Properties */}
                {selectedElement && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Properties
                    </Typography>
                    {(() => {
                      const element = elements.find(el => el.id === selectedElement);
                      if (!element) return null;

                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField
                            label="Content"
                            value={element.content}
                            onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                            size="small"
                            multiline
                            rows={2}
                          />
                          <TextField
                            label="Font Size"
                            type="number"
                            value={element.fontSize || 16}
                            onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                            size="small"
                            inputProps={{ min: 8, max: 72 }}
                          />
                          <FormControl size="small">
                            <InputLabel>Font Family</InputLabel>
                            <Select
                              value={element.fontFamily || 'Arial'}
                              onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                            >
                              <MenuItem value="Arial">Arial</MenuItem>
                              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                              <MenuItem value="Helvetica">Helvetica</MenuItem>
                              <MenuItem value="Georgia">Georgia</MenuItem>
                              <MenuItem value="Verdana">Verdana</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl size="small">
                            <InputLabel>Font Weight</InputLabel>
                            <Select
                              value={element.fontWeight || 'normal'}
                              onChange={(e) => updateElement(selectedElement, { fontWeight: e.target.value })}
                            >
                              <MenuItem value="normal">Normal</MenuItem>
                              <MenuItem value="bold">Bold</MenuItem>
                              <MenuItem value="lighter">Light</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="Color"
                            type="color"
                            value={element.color || '#000000'}
                            onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                            size="small"
                          />
                          <Button
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => deleteElement(selectedElement)}
                            size="small"
                          >
                            Hapus
                          </Button>
                        </Box>
                      );
                    })()}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Info - Auto Generate */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Generate Otomatis
                  </Typography>
                  <Typography variant="caption" component="div">
                    • Sertifikat akan di-generate untuk <strong>semua peserta yang hadir</strong><br />
                    • Data peserta diambil dari registrasi event<br />
                    • Tidak perlu pilih peserta manual
                  </Typography>
                </Alert>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={generateCertificates}
                    disabled={!selectedEvent || !templateImage || generating}
                    fullWidth
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        color: 'white'
                      }
                    }}
                  >
                    {generating ? 'Generating...' : 'Generate Semua Sertifikat'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Preview />}
                    onClick={() => setPreviewMode(!previewMode)}
                    fullWidth
                  >
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Panel - Canvas */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Canvas Editor
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  💡 Klik dan drag elemen untuk memindahkan posisi. Klik elemen untuk mengedit properties.
                </Typography>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={() => {
                      handleCanvasMouseUp();
                      setHoveredElement(null);
                      // Clear hover timeout
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '600px',
                      cursor: isDragging ? 'grabbing' : (hoveredElement ? 'grab' : 'crosshair'),
                      display: 'block',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

      </Box>
    </Container>
  );
};

export default CertificateBuilder;
