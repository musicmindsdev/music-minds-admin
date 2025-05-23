"use client"

import AnnouncementTable from "../../_components/AnnouncementTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CiExport } from "react-icons/ci";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function AnnouncementsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">Announcements Overview</h2>
        <div className="space-x-2 flex">
          <Button variant="outline" size="sm" className="text-blue-600">
            <Plus className="h-4 w-4 mr-2" /> Create Announcement
          </Button>
          <Button
            className="text-white flex items-center space-x-2"
            onClick={() => console.log("Export Data clicked")}
          >
            <CiExport className="mr-2" />
            <span className="hidden md:inline">Export Data</span>
          </Button>
        </div>
      </div>
      <Card className="rounded-none">
        <CardContent>
          <AnnouncementTable
            showCheckboxes={true}
            showPagination={true}
            headerText="All Announcements"
          />
        </CardContent>
      </Card>
    </div>
  );
}