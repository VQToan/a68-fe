import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import autoTradeLogo from "../../assets/autotrade68_logo.jpg";
import { memo, useMemo } from "react";
import { areEqual } from "@/utils/common";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = useMemo(
    () => [
      {
        title: "Giao dịch tự động",
        description:
          "Bot giao dịch tiền điện tử 24/7 không cần giám sát liên tục",
        icon: (
          <AutoGraphIcon
            fontSize="large"
            sx={{ color: theme.palette.secondary.main }}
          />
        ),
      },
      {
        title: "Chiến lược đa dạng",
        description:
          "Nhiều module bot với chiến lược trading khác nhau phù hợp với mọi thị trường",
        icon: (
          <TrendingUpIcon
            fontSize="large"
            sx={{ color: theme.palette.secondary.main }}
          />
        ),
      },
      {
        title: "An toàn và bảo mật",
        description:
          "Hệ thống an toàn tuyệt đối, không nắm giữ tiền của người dùng",
        icon: (
          <SecurityIcon
            fontSize="large"
            sx={{ color: theme.palette.secondary.main }}
          />
        ),
      },
      {
        title: "Tùy chỉnh linh hoạt",
        description:
          "Dễ dàng tùy chỉnh các thông số bot theo chiến lược giao dịch của bạn",
        icon: (
          <SettingsSuggestIcon
            fontSize="large"
            sx={{ color: theme.palette.secondary.main }}
          />
        ),
      },
    ],
    [theme]
  );

  const cryptoAssets = useMemo(
    () => [
      {
        name: "Bitcoin",
        symbol: "BTC",
        imageUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
      },
      {
        name: "Ethereum",
        symbol: "ETH",
        imageUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      },
      {
        name: "Binance Coin",
        symbol: "BNB",
        imageUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
      },
      {
        name: "Solana",
        symbol: "SOL",
        imageUrl: "https://cryptologos.cc/logos/solana-sol-logo.png",
      },
    ],
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mb: 6,
          borderRadius: 4,
          backgroundImage: "linear-gradient(to right, #000000, #0A0A0A)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: theme.palette.secondary.main,
            opacity: 0.2,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: theme.palette.error.main,
            opacity: 0.1,
          }}
        />

        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              AutoTrade68
            </Typography>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: theme.palette.secondary.main }}
            >
              Bot Giao Dịch Crypto Tự Động
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem" }}>
              Giao dịch tiền điện tử thông minh 24/7 với các bot được thiết kế
              chuyên nghiệp. Tối ưu lợi nhuận và giảm thiểu rủi ro với công nghệ
              giao dịch tự động tiên tiến.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                color="secondary"
                onClick={() => navigate("/register")}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                }}
              >
                Đăng Ký Ngay
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/module-bot")}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: theme.palette.secondary.light,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Xem Các Bot
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: "center" }}>
            <Box
              component="img"
              src={autoTradeLogo}
              alt="AutoTrade68"
              sx={{
                width: { xs: "70%", md: "90%" },
                maxWidth: 300,
                borderRadius: "50%",
                boxShadow: "0 0 30px rgba(0, 143, 57, 0.4)",
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          mb: 5,
          pt: 3,
          fontWeight: "bold",
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: -10,
            left: "50%",
            width: 80,
            height: 4,
            backgroundColor: theme.palette.secondary.main,
            transform: "translateX(-50%)",
          },
        }}
      >
        Tính Năng Nổi Bật
      </Typography>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  fontWeight="bold"
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Crypto Assets Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 8,
          borderRadius: 4,
          bgcolor: "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Hỗ Trợ Đa Dạng Tài Sản
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {cryptoAssets.map((crypto, index) => (
            <Grid
              size={{ xs: 6, sm: 3 }}
              key={index}
              sx={{ textAlign: "center" }}
            >
              <Card
                elevation={0}
                sx={{
                  bgcolor: "background.paper",
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardMedia
                  component="img"
                  image={crypto.imageUrl}
                  alt={crypto.name}
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    objectFit: "contain",
                  }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {crypto.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {crypto.symbol}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* CTA Section */}
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 4,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: "white",
        }}
      >
        <CurrencyBitcoinIcon
          sx={{ fontSize: 60, mb: 2, color: "rgba(255,255,255,0.9)" }}
        />
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Bắt đầu giao dịch thông minh ngay hôm nay
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 700, mx: "auto" }}>
          Đăng ký tài khoản để trải nghiệm bot giao dịch tiền điện tử
          AutoTrade68. Tối ưu hóa danh mục đầu tư của bạn với các công cụ giao
          dịch tự động tiên tiến.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={() => navigate("/register")}
          sx={{
            py: 1.5,
            px: 5,
            fontWeight: "bold",
          }}
          startIcon={<PriceChangeIcon />}
        >
          Đăng Ký Tài Khoản
        </Button>
      </Paper>

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AutoTrade68. Tất cả các quyền được bảo
          lưu.
        </Typography>
      </Box>
    </Container>
  );
};

export default memo(Home, areEqual);
