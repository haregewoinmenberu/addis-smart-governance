import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/research/team-leader/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/research/team-leader/dashboard"!</div>
}
