import React from "react";
import { 
  Cloud, 
  Database, 
  FileText, 
  Server, 
  Shield, 
  Code, 
  BarChart,
  UserCheck,
  FileSearch,
  MessageSquare,
  Globe,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AzureDeploymentPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">Valor Assist Azure Deployment</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive deployment guide for setting up Valor Assist on Microsoft Azure with secure data storage in Asia, AI-powered document analysis, and VA API integration.
          </p>
        </section>

        {/* Azure Environment */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Azure Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResourceCard 
              title="Resource Group"
              description="Central management for all Valor Assist services"
              icon={<Server className="h-6 w-6" />}
              feature="valor-assist-rg"
              region="East Asia"
            />
            <ResourceCard 
              title="PostgreSQL Database"
              description="Secure data storage in Asia region"
              icon={<Database className="h-6 w-6" />}
              feature="valor-assist-db"
              region="East Asia"
            />
            <ResourceCard 
              title="App Service"
              description="Scalable Node.js application hosting"
              icon={<Code className="h-6 w-6" />}
              feature="valor-assist-service"
              region="East Asia"
            />
            <ResourceCard 
              title="API Management"
              description="Secure API gateway for integrated services"
              icon={<Cloud className="h-6 w-6" />}
              feature="valor-assist-apim"
              region="East Asia"
            />
            <ResourceCard 
              title="AI Services"
              description="Document analysis and intelligent processing"
              icon={<Cpu className="h-6 w-6" />}
              feature="valor-assist-ai"
              region="East Asia"
            />
            <ResourceCard 
              title="Key Vault"
              description="Secure storage for API keys and secrets"
              icon={<Shield className="h-6 w-6" />}
              feature="valor-assist-vault"
              region="East Asia"
            />
          </div>
        </section>

        {/* Deployment Tabs */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Deployment Options</h2>
          <Tabs defaultValue="automated" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automated">Automated Deployment</TabsTrigger>
              <TabsTrigger value="manual">Manual Deployment</TabsTrigger>
            </TabsList>
            <TabsContent value="automated" className="p-4 border rounded-md mt-2">
              <h3 className="text-xl font-bold mb-4">Automated Deployment</h3>
              <p className="mb-4">
                The fastest way to deploy Valor Assist is using our automated script that provisions all required Azure resources with proper configuration.
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm mb-4">
                <p># Make the script executable</p>
                <p>chmod +x deploy-to-azure.sh</p>
                <p>&nbsp;</p>
                <p># Run the deployment script</p>
                <p>./deploy-to-azure.sh</p>
              </div>
              <p>The script will:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Create all necessary Azure resources</li>
                <li>Configure databases and services</li>
                <li>Set up initial configurations</li>
                <li>Generate and save credentials</li>
              </ul>
              <Button>Download Deployment Script</Button>
            </TabsContent>
            <TabsContent value="manual" className="p-4 border rounded-md mt-2">
              <h3 className="text-xl font-bold mb-4">Manual Deployment</h3>
              <p className="mb-4">
                Follow these steps to manually deploy each component of Valor Assist on Azure:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold">1. Create Resource Group</h4>
                  <div className="bg-muted p-2 rounded-md font-mono text-sm">
                    <p>az group create --name valor-assist-rg --location eastus2</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">2. Set up Database in Asia</h4>
                  <div className="bg-muted p-2 rounded-md font-mono text-sm">
                    <p>az postgres server create --resource-group valor-assist-rg --name valor-assist-db --location eastus2 ...</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">3. Create App Service</h4>
                  <div className="bg-muted p-2 rounded-md font-mono text-sm">
                    <p>az appservice plan create --name valor-assist-plan --resource-group valor-assist-rg ...</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button>View Complete Manual Guide</Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Azure-Enhanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard 
              title="VA API Integration"
              description="Connect directly to Veterans Affairs APIs for claims status, health records, and benefit verification using secure API Management."
              icon={<Globe className="h-10 w-10" />}
            />
            <FeatureCard 
              title="AI Document Analysis"
              description="Process VA forms and documents with Azure's AI services to extract key information and accelerate claims processing."
              icon={<FileSearch className="h-10 w-10" />}
            />
            <FeatureCard 
              title="Secure Asia Region Storage"
              description="Store all veteran data in Azure's secure Asia region database with encryption at rest and in transit."
              icon={<Database className="h-10 w-10" />}
            />
            <FeatureCard 
              title="Real-time Chat Support"
              description="Azure Communication Services power real-time chat between veterans and support staff for immediate assistance."
              icon={<MessageSquare className="h-10 w-10" />}
            />
            <FeatureCard 
              title="Veteran Identity Verification"
              description="Secure verification of veteran status through integration with VA verification APIs and Azure AD B2C."
              icon={<UserCheck className="h-10 w-10" />}
            />
            <FeatureCard 
              title="Performance Monitoring"
              description="Real-time application monitoring and analytics with Azure Application Insights and Log Analytics."
              icon={<BarChart className="h-10 w-10" />}
            />
          </div>
        </section>

        {/* API Configuration */}
        <section>
          <h2 className="text-3xl font-bold mb-6">API Management Configuration</h2>
          <Card>
            <CardHeader>
              <CardTitle>Valor Assist API Management Console</CardTitle>
              <CardDescription>
                Configure your APIs to connect with VA services and manage traffic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">VA Benefits API</h3>
                    <Badge variant="outline">https://valor-assist-apim.azure-api.net/benefits</Badge>
                    <p className="text-sm text-muted-foreground">Provides access to veteran benefits data</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Document Analysis API</h3>
                    <Badge variant="outline">https://valor-assist-apim.azure-api.net/documents</Badge>
                    <p className="text-sm text-muted-foreground">AI-powered document processing</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">VA Health API</h3>
                    <Badge variant="outline">https://valor-assist-apim.azure-api.net/health</Badge>
                    <p className="text-sm text-muted-foreground">Secure access to health records via FHIR</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">VA Facilities API</h3>
                    <Badge variant="outline">https://valor-assist-apim.azure-api.net/facilities</Badge>
                    <p className="text-sm text-muted-foreground">Location-based VA facility search</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Open API Management Console</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Security Measures */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Security & Compliance</h2>
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-bold">Data Encryption</h3>
                  <p className="text-muted-foreground">All data encrypted at rest and in transit with AES-256</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-bold">Access Controls</h3>
                  <p className="text-muted-foreground">Role-based access control (RBAC) with Azure Active Directory</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-bold">API Security</h3>
                  <p className="text-muted-foreground">API throttling, JWT validation, and OAuth 2.0 protection</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-bold">Compliance Readiness</h3>
                  <p className="text-muted-foreground">Infrastructure designed for HIPAA, FedRAMP, and SOC 2 compliance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Deploy?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Follow our comprehensive deployment documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our detailed deployment guide walks you through every step of setting up Valor Assist on Azure, from resource provisioning to security hardening.
              </p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="secondary">View Documentation</Button>
              <Button variant="outline">Contact Support</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}

// Resource Card Component
function ResourceCard({ 
  title, 
  description, 
  icon, 
  feature, 
  region 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  feature: string;
  region: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-md">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{feature}</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Region:</span>
            <p className="font-medium">{region}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Feature Card Component
function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary/5 p-6 flex justify-center">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}