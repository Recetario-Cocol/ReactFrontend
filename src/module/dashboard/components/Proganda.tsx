import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Link,
} from "@mui/material";

export default function App() {
  const tortas = [
    {
      nombre: "Torta de cumpleaños",
      descripcion: "Decoración personalizada. ¡Consultanos por sabores!",
      imagen: "https://source.unsplash.com/featured/?birthday-cake",
    },
    {
      nombre: "Torta de chocolate",
      descripcion: "Bizcochuelo húmedo y cobertura de mousse.",
      imagen: "https://source.unsplash.com/featured/?chocolate-cake",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#fff8f5", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "#ffd5cb", py: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Cocol
        </Typography>
        <Typography variant="h6">Tortas artesanales hechas con amor en La Plata 🍰</Typography>
      </Box>
      <Container sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {tortas.map((torta, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardMedia component="img" height="200" image={torta.imagen} alt={torta.nombre} />
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {torta.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {torta.descripcion}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Box sx={{ bgcolor: "#ffe8e1", textAlign: "center", py: 3 }}>
        <Typography variant="body1">
          📩 Pedidos por Instagram:{" "}
          <Link href="https://instagram.com/cocol.tortas" target="_blank">
            @cocol.tortas
          </Link>{" "}
          | WhatsApp: 221-XXX-XXXX
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          &copy; 2025 Cocol - Pastelería Artesanal
        </Typography>
      </Box>
    </Box>
  );
}
