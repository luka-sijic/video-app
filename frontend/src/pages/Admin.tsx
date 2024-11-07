'use client'

import * as React from 'react'
import { BarChart3, FileX, LayoutDashboard, Settings, ShieldAlert, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = React.useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Management', icon: FileX },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  <span className="font-semibold">Admin Panel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center border-b px-4">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </header>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <main className="p-6">
              {activeSection === 'dashboard' && <DashboardSection />}
              {activeSection === 'users' && <UserManagementSection />}
              {activeSection === 'content' && <ContentManagementSection />}
              {activeSection === 'settings' && <SystemSettingsSection />}
              {activeSection === 'analytics' && <AnalyticsSection />}
            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function DashboardSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">10,245</div>
          <p className="text-xs text-muted-foreground">+180 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8,734</div>
          <p className="text-xs text-muted-foreground">+2.1% from last week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">File Uploads</CardTitle>
          <FileX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">573</div>
          <p className="text-xs text-muted-foreground">+201 since yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98.5%</div>
          <p className="text-xs text-muted-foreground">+0.2% from last hour</p>
        </CardContent>
      </Card>
    </div>
  )
}

function UserManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input placeholder="Search users..." className="max-w-sm" />
            <Button>Search</Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="flex space-x-2">
              <Button variant="outline">View All Users</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">User Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Ban User</DropdownMenuItem>
                  <DropdownMenuItem>Kick User</DropdownMenuItem>
                  <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContentManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Manage uploads and content moderation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button variant="destructive">Stop All File Uploads</Button>
            <Button variant="outline">Resume File Uploads</Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Content Moderation</h3>
            <div className="flex space-x-2">
              <Button variant="outline">Review Flagged Content</Button>
              <Button variant="outline">Manage Post Categories</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemSettingsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure system-wide settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="site-name" className="text-sm font-medium">Site Name</label>
              <Input id="site-name" placeholder="Enter site name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">Admin Email</label>
              <Input id="admin-email" type="email" placeholder="admin@example.com" />
            </div>
          </div>
          <Button>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>View and analyze system metrics and user behavior.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-[2/1] rounded-lg bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12.3%</div>
                <p className="text-xs text-muted-foreground">Compared to last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.7%</div>
                <p className="text-xs text-muted-foreground">+5.4% from last week</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}