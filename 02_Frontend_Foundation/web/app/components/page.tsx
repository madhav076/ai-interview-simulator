"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  Spinner,
  Textarea,
} from "@/components/ui";

export default function ComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
          Component Library
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Reusable UI Components
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Preview the shared building blocks for the AI Interview Simulator
          frontend foundation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Button</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button disabled>Disabled</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Badge</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Input</h2>
          </CardHeader>
          <CardBody className="grid gap-4">
            <Input
              label="Full name"
              name="fullName"
              placeholder="Enter your name"
            />
            <Input
              error="Please enter a valid email address."
              label="Email"
              name="email"
              placeholder="name@example.com"
            />
            <Input
              disabled
              label="Disabled field"
              name="disabledInput"
              placeholder="Disabled"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Textarea</h2>
          </CardHeader>
          <CardBody className="grid gap-4">
            <Textarea
              label="Interview notes"
              name="notes"
              placeholder="Write a short note..."
            />
            <Textarea
              error="Notes should be at least 20 characters."
              label="Feedback"
              name="feedback"
              placeholder="Add feedback"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Spinner</h2>
          </CardHeader>
          <CardBody className="flex items-center gap-5">
            <Spinner size="small" />
            <Spinner size="medium" />
            <Spinner size="large" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-950">Modal</h2>
          </CardHeader>
          <CardBody>
            <Button onClick={() => setIsModalOpen(true)}>Open modal</Button>
          </CardBody>
          <CardFooter>
            <p className="text-sm text-slate-600">
              The modal includes a header, body, footer, and close button.
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-950">Alert</h2>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-2">
          <Alert title="Success" variant="success">
            Your changes were saved successfully.
          </Alert>
          <Alert title="Error" variant="error">
            Something went wrong. Please review the highlighted fields.
          </Alert>
          <Alert title="Warning" variant="warning">
            This action may affect the current session.
          </Alert>
          <Alert title="Info" variant="info">
            New components can be imported from the UI index file.
          </Alert>
        </CardBody>
      </Card>

      <Modal
        body={
          <p>
            This is a reusable modal body area. It can display confirmation
            text, simple content, or future form controls.
          </p>
        }
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Continue</Button>
          </div>
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Preview Modal"
      />
    </section>
  );
}
