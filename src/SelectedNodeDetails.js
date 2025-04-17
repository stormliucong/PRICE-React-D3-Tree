import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const SelectedNodeDetails = ({ selectedNode }) => {
    return (
      <Card elevation={3} sx={{ maxWidth: 400, margin: '16px auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography variant="body1">
              <strong>Node Type:</strong> {selectedNode.nodeType}
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {selectedNode.name}
            </Typography>
            <Typography variant="body1">
              <strong>Cost:</strong> {selectedNode.cost}
            </Typography>
            <Typography variant="body1">
              <strong>Probability:</strong> {selectedNode.probability}
            </Typography>
            <Typography variant="body1">
              <strong>Time (weeks):</strong> {selectedNode.time}
            </Typography>
            <Typography variant="body1">
              <strong>Cumulative Time (weeks):</strong> {selectedNode.cumulative_time}
            </Typography>
            {selectedNode.expected_cost !== null && (
              <Typography variant="body1">
                <strong>Expected Cost:</strong> {parseInt(selectedNode.expected_cost)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

export default SelectedNodeDetails;