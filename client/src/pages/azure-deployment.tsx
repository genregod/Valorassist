import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";

export function AzureDeploymentPage() {
  const deploymentStatus = "deployed"; // This would come from your deployment API

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Azure Deployment Status</h1>
          <p className="text-muted-foreground">
            Monitor and manage your Valor Assist deployment on Microsoft Azure
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Deployment Status
            </CardTitle>
            <CardDescription>
              Current status of your Azure App Service deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Deployed
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <Badge variant="secondary">Production</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Region</span>
              <span className="text-sm">East Asia</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Updated</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your deployment with these common actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Application
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              View Logs
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Deployment History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}