import { Text } from '@react-three/drei'
import { ROOM_BY_ID } from '../../data/rooms'
import { Bench, FONT, Frame, Panel, SpotAt, Vitrine } from '../kit'
import { TEX } from '../tex'
import { IndoorShell } from './shell'

function Band({ x, w, color, title, years }: { x: number; w: number; color: string; title: string; years: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 3.9, 0]}>
        <boxGeometry args={[w - 0.1, 0.5, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <Text font={FONT} position={[-w / 2 + 0.2, 3.9, 0.03]} fontSize={0.26} color="#f6eee0" anchorX="left" anchorY="middle">
        {title}
      </Text>
      <Text font={FONT} position={[w / 2 - 0.2, 3.9, 0.03]} fontSize={0.13} letterSpacing={0.2} color="#f6eee0" anchorX="right" anchorY="middle">
        {years}
      </Text>
    </group>
  )
}

function Rails() {
  return (
    <group position={[4, 0, -5.2]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-3 + i * 0.55, 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.08, 1.6]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[0, 0.12, z]} castShadow>
          <boxGeometry args={[6.4, 0.1, 0.07]} />
          <meshStandardMaterial color="#6b6a66" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

export function Historia() {
  const room = ROOM_BY_ID.historia
  const [w, d] = room.size
  const hw = w / 2
  const z = -d / 2 + 0.03
  return (
    <IndoorShell room={room} floor={TEX.parquet} floorTile={3} floorRough={0.3} floorColor="#a8704e" wall="#efe2cb" ambient={0.35}>
      <group position={[0, 0, z]}>
        <Band x={-8} w={8} color="#9a6a2e" title="Pre-colonial Kenya" years="COMMUNITIES · LANGUAGES" />
        <Band x={0} w={8} color="#7c2d22" title="Colonial rule" years="1895 – 1963" />
        <Band x={8} w={8} color="#1f5a3a" title="Independent Kenya" years="FROM 1963" />
      </group>
      <Panel pos={[-8, 2.2, z]} w={3.2} h={1.8} kicker="Origins" title="Communities and language groups" body="The origin of Kenya's communities, and the interaction among them before colonial rule." bg="#3a2c20" />
      <Panel pos={[0, 2.2, z]} w={3.2} h={1.8} kicker="Colonial period" title="Railway, land and war" body="The Kenya–Uganda Railway, land alienation and the two world wars reshaped Kenyan lives." bg="#3a2c20" />
      <Panel pos={[8, 2.2, z]} w={3.2} h={1.8} kicker="Independence" title="Uhuru" body="The struggle for independence, and independence on 12 December 1963." bg="#3a2c20" />
      <Rails />
      <Frame pos={[hw - 0.03, 2.3, 4]} rot={-Math.PI / 2} w={2.2} src="/photos/history-vitrine.jpg" caption="Textiles and photographs · NMK photograph" />
      <group position={[hw - 0.03, 0, -1.5]} rotation-y={-Math.PI / 2}>
        {['#111111', '#b1241e', '#1f6b3a'].map((c, i) => (
          <mesh key={c} position={[0, 2.9 - i * 0.36, 0]}>
            <planeGeometry args={[2.2, 0.3]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))}
        {[2.72, 2.36].map((y) => (
          <mesh key={y} position={[0, y, 0.005]}>
            <planeGeometry args={[2.2, 0.05]} />
            <meshStandardMaterial color="#f5f1e8" />
          </mesh>
        ))}
      </group>
      <Bench pos={[0, 0, 2]} />
      {[-8, 0, 8].map((x) => (
        <SpotAt key={x} pos={[x, 4.8, -2]} at={[x, 2.4, -d / 2]} intensity={28} angle={0.55} />
      ))}
      <SpotAt pos={[4, 4.8, -2]} at={[4, 0, -5.2]} intensity={18} angle={0.4} />
      <SpotAt pos={[6, 4.8, 4]} at={[hw, 2.3, 4]} intensity={20} angle={0.4} />
    </IndoorShell>
  )
}

function Stool({ pos, color = '#5a3a22' }: { pos: [number, number, number]; color?: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.04, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.09, 0.07, Math.sin(a) * 0.09]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.14, 6]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Shield({ pos, rot = 0 }: { pos: [number, number, number]; rot?: number }) {
  return (
    <group position={pos} rotation-y={rot}>
      <mesh scale={[0.28, 0.6, 0.05]} castShadow>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#b8894e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.05]} scale={[0.08, 0.5, 0.02]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#7a2a1c" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Cycles() {
  const room = ROOM_BY_ID.cycles
  const [w, d] = room.size
  const hw = w / 2
  const hd = d / 2
  return (
    <IndoorShell room={room} floor={TEX.stoneFloor} floorTile={2.2} floorRough={0.28} floorColor="#f0dcc0" wall="#efe0c2" ambient={0.4}>
      <Panel pos={[-6, 2.3, -hd + 0.03]} w={3} h={1.6} kicker="Stage one" title="Childhood" body="Naming, care and first lessons within the community." bg="#5a3a1e" />
      <Panel pos={[6, 2.3, -hd + 0.03]} w={3} h={1.6} kicker="Stage two" title="Youth" body="Initiation, age-sets and learning adult roles." bg="#5a3a1e" />
      <Panel pos={[hw - 0.03, 2.3, 4]} rot={-Math.PI / 2} w={3} h={1.6} kicker="Stage three" title="Adulthood" body="Marriage, homestead, livelihood and leadership." bg="#5a3a1e" />
      <Panel pos={[-hw + 0.03, 2.3, 4]} rot={Math.PI / 2} w={3} h={1.6} kicker="Stage four" title="The ancestral stage" body="Elders pass on and are remembered by those they shaped." bg="#5a3a1e" />
      <Vitrine pos={[-3, 0, 0]} size={[1.6, 1, 1]}>
        <Stool pos={[-0.45, 0, 0]} />
        <Stool pos={[0.1, 0, 0.1]} color="#3a2616" />
        <mesh position={[0.5, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial color="#b0703a" roughness={0.5} />
        </mesh>
      </Vitrine>
      <Vitrine pos={[3, 0, 0]} size={[1.6, 1.3, 1]}>
        <Shield pos={[-0.35, 0.62, 0]} rot={0.2} />
        <Shield pos={[0.35, 0.62, 0]} rot={-0.2} />
      </Vitrine>
      <Frame pos={[0, 2.4, hd - 0.03]} rot={Math.PI} w={3.4} src="/photos/cycles-of-life.jpg" caption="The Cycles of Life gallery · NMK photograph" />
      <SpotAt pos={[-6, 4.8, -4]} at={[-6, 2.3, -hd]} intensity={24} angle={0.5} />
      <SpotAt pos={[6, 4.8, -4]} at={[6, 2.3, -hd]} intensity={24} angle={0.5} />
      <SpotAt pos={[0, 4.8, 0]} at={[-3, 1, 0]} intensity={24} angle={0.35} />
      <SpotAt pos={[0, 4.8, 0]} at={[3, 1, 0]} intensity={24} angle={0.35} />
    </IndoorShell>
  )
}

export function JoyAdamson() {
  const room = ROOM_BY_ID['joy-adamson']
  const [w, d] = room.size
  const hw = w / 2
  const hd = d / 2
  return (
    <IndoorShell room={room} floor={TEX.parquet} floorTile={3} floorRough={0.3} floorColor="#b58663" wall="#e9e2d2" ambient={0.4}>
      <Panel pos={[0, 2.3, -hd + 0.03]} w={4.2} h={2} kicker="1910 – 1980" title="Joy Adamson" body="Illustrator, conservationist and author. Her portraits of the Peoples of Kenya and her botanical and wildlife studies are held in the museum's archives." bg="#2f3a2c" accent="#e0b25a" />
      <Panel pos={[-hw + 0.03, 2.3, 0]} rot={Math.PI / 2} w={4.4} h={2} kicker="Peoples of Kenya" title="Over seven hundred portraits" body="Painted across Kenya from the late 1940s. The 2014 exhibition shows 50 of them with objects from the ethnographic collections. No licensable photographs of the originals were available for this tour." bg="#3a2c20" />
      {[-4.2, -1.4, 1.4, 4.2].map((z, i) => (
        <Frame key={z} pos={[hw - 0.03, 2.2, z]} rot={-Math.PI / 2} w={1.5} src="/illustrative/botanical.jpg" frame="#3a2c20" caption={i === 0 ? 'Botanical study · illustrative, not an Adamson original' : undefined} />
      ))}
      <Vitrine pos={[0, 0, 1]} size={[1.4, 0.5, 0.8]}>
        {[-0.4, -0.2, 0, 0.2].map((x, i) => (
          <mesh key={x} position={[x, 0.02, 0]} rotation={[Math.PI / 2, 0, 0.2 * i]} castShadow>
            <cylinderGeometry args={[0.012, 0.008, 0.5, 6]} />
            <meshStandardMaterial color={['#8a5a2a', '#3a2616', '#b0703a', '#5a3a22'][i]} />
          </mesh>
        ))}
        <mesh position={[0.45, 0.01, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial color="#efe6d4" roughness={0.9} />
        </mesh>
      </Vitrine>
      {[-4.2, -1.4, 1.4, 4.2].map((z) => (
        <SpotAt key={z} pos={[4, 4.8, z]} at={[hw, 2.2, z]} intensity={14} angle={0.3} />
      ))}
      <SpotAt pos={[0, 4.8, 1]} at={[0, 2.3, -hd]} intensity={26} angle={0.5} />
      <SpotAt pos={[-4, 4.8, 0]} at={[-hw, 2.3, 0]} intensity={24} angle={0.5} />
    </IndoorShell>
  )
}
