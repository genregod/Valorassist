import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function AzureDeploymentPage() {
  const deploymentSteps = [
    {
      title: "Resource Group Setup",
      status: "completed",
      description: "Azure Resource Group configured for Valor Assist"
    },
    {
      title: "App Service Deployment",
      status: "completed", 
      description: "Web application deployed to Azure App Service"
    },
    {
      title: "Database Configuration",
      status: "completed",
      description: "PostgreSQL database provisioned and connected"
    },
    {
      title: "Domain & SSL",
      status: "pending",
      description: "Custom domain and SSL certificate setup"
    },
    {
      title: "Monitoring Setup",
      status: "pending",
      description: "Application insights and monitoring configuration"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Azure Deployment Status</h1>
        <p className="text-muted-foreground">
          Monitor the progress of your Valor Assist deployment to Azure Cloud Platform
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Deployment Overview
            </CardTitle>
            <CardDescription>
              Your application has been successfully deployed to Azure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Application URL:</span>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://valor-assist.azurewebsites.net" target="_blank" rel="noopener noreferrer">
                    valor-assist.azurewebsites.net
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Resource Group:</span>
                <span className="text-muted-foreground">valor-assist-rg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Region:</span>
                <span className="text-muted-foreground">East US</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Steps</CardTitle>
            <CardDescription>
              Track the progress of each deployment component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{step.title}</h3>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Complete these steps to finalize your deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Configure custom domain and SSL certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Set up application monitoring and alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Configure backup and disaster recovery</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild>
          <a href="/" className="inline-flex items-center gap-2">
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
}

export default AzureDeploymentPage;