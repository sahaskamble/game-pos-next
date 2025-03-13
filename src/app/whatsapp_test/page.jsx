"use client";

import { useWhatsappIntegration } from "@/hooks/useWhatsappIntegration";
import { MessagesTable } from "./components/messages-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WhatsappTestPage() {
  const { Messages, loading, mutate } = useWhatsappIntegration();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className='flex items-center justify-between w-full pr-6'>
          <CardHeader>
            <CardTitle>WhatsApp Messages</CardTitle>
            <CardDescription>List of all the messages till now</CardDescription>
          </CardHeader>
          <div>
            <Button> Send Message </Button>
          </div>
        </div>
        <CardContent>
          <MessagesTable messages={Messages} />
        </CardContent>
      </Card>
    </div>
  );
}
