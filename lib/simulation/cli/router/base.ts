export interface RouterBrandCLI {
  mode: string
  currentIfs: string[]
  execute(cmd: string): string[]
  getBanner(): string[]
  getPrompt(): string
  getCompletions(partial: string): string[]
}
