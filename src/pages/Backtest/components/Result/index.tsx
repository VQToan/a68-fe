import React, { useCallback, memo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { areEqual } from "@/utils/common";
import ResultList from "./ResultList";
import ResultView from "./ResultView";
import Summary from "./Summary";

interface BacktestResultProps {
  id?: string;
  onBack?: () => void;
}

const BacktestResult: React.FC<BacktestResultProps> = ({
  id: propId,
  onBack,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = propId || paramId;
  const [symbol, setSymbol] = useState<string>("");
  const [selectedResultId, setSelectedResultId] = useState<
    string | undefined
  >();

  const handleBackToList = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate("/backtest");
    }
  }, [onBack, navigate]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Kết quả Backtest
        </Typography>
      </Box>

      {/* Backtest Process Information */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Summary id={id} setSymbol={setSymbol} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <ResultList
              processId={id}
              symbol={symbol}
              selectedResultId={selectedResultId}
              onViewResult={(resultId) => setSelectedResultId(resultId)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Result Detail Section */}
      {selectedResultId && (
        <ResultView selectedResultId={selectedResultId} symbol={symbol} />
      )}
    </Container>
  );
};

export default memo(BacktestResult, areEqual);
