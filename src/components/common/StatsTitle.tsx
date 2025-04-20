import { Group, Text } from '@mantine/core'

interface StatsTitleProps {
  title: string
}

export const StatsTitle = ({ title }: StatsTitleProps) => {
  return (
    <Group justify='stretch' align='center' mb="md">
      <Text fw={400} size="md">{title.toUpperCase()}</Text>
      <hr style={{ flexGrow: 1, borderColor: '#89a', borderWidth: '0.1px' }} />
    </Group>
  )
} 