import { useState } from "react"
import { Link } from 'react-router-dom'
import { Home, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Dashboard() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Projet Alpha",
      description: "Plateforme de gestion de contenu",
      progress: 75,
      lastUpdated: "Il y a 2 jours",
    },
    {
      id: 2,
      title: "Projet Beta",
      description: "Application d'analyse de données",
      progress: 45,
      lastUpdated: "Il y a 5 jours",
    },
    {
      id: 3,
      title: "Projet Gamma",
      description: "Système de gestion de la relation client",
      progress: 90,
      lastUpdated: "Aujourd'hui",
    },
  ])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">B2B SaaS</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link to="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                <Home size={18} />
                <span>Accueil</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                <PlusCircle size={18} />
                <span>Nouveau Projet</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Jean Dupont</p>
              <p className="text-xs text-muted-foreground">jean@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Mes Projets</h2>
          <p className="text-muted-foreground">Gérez vos projets existants ou créez-en un nouveau</p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Cards */}
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">Mis à jour {project.lastUpdated}</p>
              </CardFooter>
            </Card>
          ))}

          {/* New Project Card */}
          <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-muted p-3">
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Nouveau Projet</h3>
              <p className="text-sm text-muted-foreground">Cliquez pour créer un nouveau projet</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 