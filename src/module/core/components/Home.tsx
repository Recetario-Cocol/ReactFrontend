import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import HeaderApp from "./HeaderApp";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardService } from "../../dashboard/useDashboardService";

export default function Home() {
  const DashboardService = useDashboardService();
  const [cards, setCards] = useState([
    {
      id: 1,
      title: "Unidades",
      description: "Unidades basicas para no confundir cantidades en las recetas.",
      url: "/Unidades",
      cant: 0,
    },
    {
      id: 2,
      title: "Productos",
      description:
        "Diferentes paquetes de Productos cada uno con su precio para poder elegirlos en las recetas y sacar un costo mas fiable de cada una.",
      url: "/Paquetes",
      cant: 0,
    },
    {
      id: 3,
      title: "Recetas",
      description:
        "Tus recetas privadas en las cuales podes cargar los ingredientes, instruciones, cuantas porcines rindes, y el consto con los precios de los productos cargados.",
      url: "/Recetas",
      cant: 0,
    },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const totalesResponse = await DashboardService.getTotales();
    const updatedCards = cards.map((card) => {
      switch (card.id) {
        case 1:
          return { ...card, cant: totalesResponse.unidades };
        case 2:
          return { ...card, cant: totalesResponse.productos };
        case 3:
          return { ...card, cant: totalesResponse.recetas };
        default:
          return card;
      }
    });
    setCards(updatedCards);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}>
      <HeaderApp titulo="Recetas" />
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 100%)",
            md: "repeat(3, minmax(300px, 1fr))",
          },
          gap: 5,
          justifyItems: "center",
          paddingX: "20px",
          boxSizing: "border-box",
        }}>
        {cards.map((card) => (
          <Card key={card.id} sx={{ width: 1 }}>
            <CardActionArea onClick={() => navigate(card.url)} sx={{ height: "100%" }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h5" component="div">
                  {card.title} ({card.cant})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
