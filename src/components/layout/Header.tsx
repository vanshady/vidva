import { Group, Title, Image } from '@mantine/core'

export const Header = () => {
  return (
    <Group justify="center" gap="0" mb="xl">
      <Image src="/logo.png" alt="Vidva Logo" w={40} h={40} />
      <Title order={1}>VIDVA</Title>
    </Group>
  )
} 