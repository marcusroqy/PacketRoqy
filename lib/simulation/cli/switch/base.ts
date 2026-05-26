export interface SwitchBrandCLI {
  mode: string
  currentPorts: string[]
  currentVlan: number
  vlans: Map<number, string>
  portVlan: Map<string, number>
  portMode: Map<string, 'access' | 'trunk'>
  execute(cmd: string): string[]
  getBanner(): string[]
  getPrompt(): string
  getCompletions(partial: string): string[]
}
