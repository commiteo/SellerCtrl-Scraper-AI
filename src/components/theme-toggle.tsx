import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 bg-[#1F1F1F] border-[#2A2A2A] hover:bg-[#2A2A2A] hover:border-[#FF7A00] transition-all duration-200"
        >
          {theme === 'light' ? (
            <Sun className="h-4 w-4 text-[#FF7A00]" />
          ) : theme === 'dark' ? (
            <Moon className="h-4 w-4 text-[#FF7A00]" />
          ) : (
            <Monitor className="h-4 w-4 text-[#FF7A00]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-[#2A2A2A] border-[#404040] shadow-xl backdrop-blur-md"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="text-[#E0E0E0] hover:bg-[#3A3A3A] hover:text-[#FF7A00] cursor-pointer transition-colors duration-200"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="text-[#E0E0E0] hover:bg-[#3A3A3A] hover:text-[#FF7A00] cursor-pointer transition-colors duration-200"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="text-[#E0E0E0] hover:bg-[#3A3A3A] hover:text-[#FF7A00] cursor-pointer transition-colors duration-200"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle button version
export function SimpleThemeToggle() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 bg-[#1F1F1F] border-[#2A2A2A] hover:bg-[#2A2A2A] hover:border-[#FF7A00] transition-all duration-200"
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4 text-[#FF7A00]" />
      ) : theme === 'dark' ? (
        <Moon className="h-4 w-4 text-[#FF7A00]" />
      ) : (
        <Monitor className="h-4 w-4 text-[#FF7A00]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}