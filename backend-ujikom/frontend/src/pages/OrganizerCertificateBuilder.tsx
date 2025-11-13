import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'signature';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const OrganizerCertificateBuilder: React.FC = () => {
  const [templateName, setTemplateName] = useState('Template Baru');
  const [elements, setElements] = useState<CertificateElement[]>([
    {
      id: '1',
      type: 'text',
      content: 'SERTIFIKAT PENGHARGAAN',
      x: 50,
      y: 20,
      width: 400,
      height: 40,
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center'
    },
    {
      id: '2',
      type: 'text',
      content: 'Diberikan kepada',
      x: 50,
      y: 80,
      width: 400,
      height: 20,
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#34495e',
      textAlign: 'center'
    },
    {
      id: '3',
      type: 'text',
      content: '{PARTICIPANT_NAME}',
      x: 50,
      y: 120,
      width: 400,
      height: 30,
      fontSize: 28,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#e74c3c',
      textAlign: 'center'
    },
    {
      id: '4',
      type: 'text',
      content: 'Atas partisipasi dalam {EVENT_NAME}',
      x: 50,
      y: 170,
      width: 400,
      height: 20,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#34495e',
      textAlign: 'center'
    },
    {
      id: '5',
      type: 'text',
      content: 'Tanggal: {EVENT_DATE}',
      x: 50,
      y: 220,
      width: 200,
      height: 20,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#7f8c8d',
      textAlign: 'left'
    }
  ]);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');

  const handleElementUpdate = (id: string, updates: Partial<CertificateElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleAddElement = (type: 'text' | 'image' | 'signature') => {
    const newElement: CertificateElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'Teks Baru' : '',
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 30 : 50,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left'
    };
    setElements([...elements, newElement]);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleSaveTemplate = () => {
    const template = {
      name: templateName,
      elements,
      background: canvasBackground,
      createdAt: new Date().toISOString()
    };
    
    // Simulate saving
    console.log('Saving template:', template);
    alert('Template berhasil disimpan!');
  };

  const handlePreview = () => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Preview Sertifikat</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .certificate { 
                width: 500px; 
                height: 300px; 
                background: ${canvasBackground}; 
                position: relative; 
                border: 2px solid #ddd;
                margin: 0 auto;
              }
              .element { position: absolute; }
            </style>
          </head>
          <body>
            <h2>Preview Sertifikat</h2>
            <div class="certificate">
              ${elements.map(el => `
                <div class="element" style="
                  left: ${el.x}px; 
                  top: ${el.y}px; 
                  width: ${el.width}px; 
                  height: ${el.height}px;
                  font-size: ${el.fontSize}px;
                  font-family: ${el.fontFamily};
                  font-weight: ${el.fontWeight};
                  color: ${el.color};
                  text-align: ${el.textAlign};
                ">
                  ${el.content.replace('{PARTICIPANT_NAME}', 'John Doe')
                             .replace('{EVENT_NAME}', 'Workshop React Advanced')
                             .replace('{EVENT_DATE}', '15 November 2024')}
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, borderRadius: 3, background: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Certificate Builder
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Buat dan desain template sertifikat
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handlePreview}>
                Preview
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSaveTemplate}
                sx={{
                  background: 'linear-gradient(45deg, #4f46e5, #3730a3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3730a3, #312e81)',
                  }
                }}
              >
                Simpan Template
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Panel - Tools */}
          <Paper sx={{ width: 300, p: 3, borderRadius: 3, background: 'white', height: 'fit-content' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Tools & Properties
            </Typography>

            {/* Template Name */}
            <TextField
              label="Nama Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />

            {/* Add Elements */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Tambah Elemen
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleAddElement('text')}
              >
                Teks
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleAddElement('image')}
              >
                Gambar
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleAddElement('signature')}
              >
                Tanda Tangan
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Element Properties */}
            {selectedElementData && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Properties Elemen
                </Typography>

                <TextField
                  label="Konten"
                  value={selectedElementData.content}
                  onChange={(e) => handleElementUpdate(selectedElement!, { content: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="X"
                    type="number"
                    value={selectedElementData.x}
                    onChange={(e) => handleElementUpdate(selectedElement!, { x: parseInt(e.target.value) })}
                    size="small"
                  />
                  <TextField
                    label="Y"
                    type="number"
                    value={selectedElementData.y}
                    onChange={(e) => handleElementUpdate(selectedElement!, { y: parseInt(e.target.value) })}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Width"
                    type="number"
                    value={selectedElementData.width}
                    onChange={(e) => handleElementUpdate(selectedElement!, { width: parseInt(e.target.value) })}
                    size="small"
                  />
                  <TextField
                    label="Height"
                    type="number"
                    value={selectedElementData.height}
                    onChange={(e) => handleElementUpdate(selectedElement!, { height: parseInt(e.target.value) })}
                    size="small"
                  />
                </Box>

                {selectedElementData.type === 'text' && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>Font Size: {selectedElementData.fontSize}px</Typography>
                    <Slider
                      value={selectedElementData.fontSize || 16}
                      onChange={(e, value) => handleElementUpdate(selectedElement!, { fontSize: value as number })}
                      min={8}
                      max={72}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Font Family</InputLabel>
                      <Select
                        value={selectedElementData.fontFamily || 'Arial'}
                        onChange={(e) => handleElementUpdate(selectedElement!, { fontFamily: e.target.value })}
                        label="Font Family"
                      >
                        <MenuItem value="Arial">Arial</MenuItem>
                        <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                        <MenuItem value="Helvetica">Helvetica</MenuItem>
                        <MenuItem value="Georgia">Georgia</MenuItem>
                        <MenuItem value="Verdana">Verdana</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Text Align</InputLabel>
                      <Select
                        value={selectedElementData.textAlign || 'left'}
                        onChange={(e) => handleElementUpdate(selectedElement!, { textAlign: e.target.value as any })}
                        label="Text Align"
                      >
                        <MenuItem value="left">Left</MenuItem>
                        <MenuItem value="center">Center</MenuItem>
                        <MenuItem value="right">Right</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Color"
                      type="color"
                      value={selectedElementData.color || '#000000'}
                      onChange={(e) => handleElementUpdate(selectedElement!, { color: e.target.value })}
                      fullWidth
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <IconButton
                        onClick={() => handleElementUpdate(selectedElement!, { 
                          fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                        })}
                        color={selectedElementData.fontWeight === 'bold' ? 'primary' : 'default'}
                      >
                        <FormatBoldIcon />
                      </IconButton>
                    </Box>
                  </>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteElement(selectedElement!)}
                  fullWidth
                >
                  Hapus Elemen
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Canvas Properties */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Canvas Properties
            </Typography>
            <TextField
              label="Background Color"
              type="color"
              value={canvasBackground}
              onChange={(e) => setCanvasBackground(e.target.value)}
              fullWidth
            />
          </Paper>

          {/* Main Canvas */}
          <Box sx={{ flexGrow: 1 }}>
            <Paper sx={{ p: 3, borderRadius: 3, background: 'white', minHeight: 600 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Canvas (500x300px)
              </Typography>
              
              <Box
                sx={{
                  width: 500,
                  height: 300,
                  background: canvasBackground,
                  border: '2px solid #ddd',
                  position: 'relative',
                  margin: '0 auto',
                  cursor: 'crosshair'
                }}
              >
                {elements.map((element) => (
                  <Box
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    sx={{
                      position: 'absolute',
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      border: selectedElement === element.id ? '2px dashed #4f46e5' : '1px solid transparent',
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: element.textAlign || 'left',
                      padding: '2px',
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                      '&:hover': {
                        border: '1px dashed #4f46e5'
                      }
                    }}
                  >
                    {element.type === 'text' && element.content}
                    {element.type === 'image' && (
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        background: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#666'
                      }}>
                        Image Placeholder
                      </Box>
                    )}
                    {element.type === 'signature' && (
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        background: '#f9f9f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#666',
                        border: '1px dashed #ccc'
                      }}>
                        Signature
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Klik pada elemen untuk mengedit. Gunakan panel kiri untuk mengatur properties.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Variabel yang tersedia: {'{PARTICIPANT_NAME}'}, {'{EVENT_NAME}'}, {'{EVENT_DATE}'}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default OrganizerCertificateBuilder;
