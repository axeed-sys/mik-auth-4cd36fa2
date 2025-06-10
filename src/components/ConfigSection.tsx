
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Router } from 'lucide-react';
import RadiusConfig from './RadiusConfig';
import RouterConfig from './RouterConfig';

const ConfigSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage RADIUS servers and router configurations
        </p>
      </div>

      <Tabs defaultValue="radius" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="radius" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            RADIUS Config
          </TabsTrigger>
          <TabsTrigger value="router" className="flex items-center gap-2">
            <Router className="h-4 w-4" />
            Router Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="radius">
          <RadiusConfig />
        </TabsContent>

        <TabsContent value="router">
          <RouterConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigSection;
