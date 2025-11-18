import { View } from 'react-native'

export default function Card({ children, selected = false, style }: any) {
  return (
    <View
      style={[
        {
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: selected ? '#3b34ff' : '#e5e7eb',
          backgroundColor: selected ? '#eef2ff' : '#fff',
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
