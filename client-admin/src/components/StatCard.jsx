import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Box
      p={5}
      bg="background.white"
      boxShadow="md"
      borderRadius="lg"
      borderLeft="4px"
      borderColor={`${color}.500`}
    >
      <Flex align="center">
        <Icon as={icon} w={8} h={8} color={`${color}.500`} mr={4} />
        <Box>
          <Text fontWeight="bold" color="gray.500" textTransform="uppercase">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default StatCard;