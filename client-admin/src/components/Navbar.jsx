import React from 'react';
import { Box, Flex, Text, Avatar,IconButton } from '@chakra-ui/react';
import { Menu, Button, Text as MantineText } from '@mantine/core';
import { IconSettings, IconMessageCircle, IconPhoto, IconSearch, IconArrowsLeftRight, IconTrash } from '@tabler/icons-react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Navbar = ({ onOpen }) => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="4"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      h="14"
    >
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        size="md"
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
      />

      <Text fontSize="xl" fontWeight="bold" display={{ base: 'none', md: 'block' }}>
        Dashboard
      </Text>
      
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button variant="subtle" color="gray">
            <Avatar size="sm" name="Super Admin" src="https://bit.ly/dan-abramov" />
            <Text ml={2} color="black">Super Admin</Text>
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Application</Menu.Label>
          <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
          <Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>
          
          <Menu.Divider />

          <Menu.Item color="red" icon={<IconTrash size={14} />}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
};

export default Navbar;