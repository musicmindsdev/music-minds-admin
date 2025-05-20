import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { useState } from "react";
  import { Card, CardContent, CardHeader } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import Image from "next/image";
  import Lis from "@/public/grid-6.svg";
  import Crd from "@/public/menu-board.svg"
  
  interface Performer {
    rank: string;
    name: string;
    email: string;
    post: string;
    engagementStat: string;
    lastActive: string;
  }
  
  const performers: Performer[] = [
    {
      rank: "#1",
      name: "Daniel Adaeri C.",
      email: "danieladaeri@yahoo.com",
      post: "Had the perfect time today at North carolina. Thank you for coming out! Myself and the team appreciate...",
      engagementStat: "Musician",
      lastActive: "19/04/25 - 9:00 AM",
    },
    {
      rank: "#2",
      name: "Michael Ajobi E.",
      email: "michaelajobi@gmail.com",
      post: "Had the perfect time today at North carolina. Thank you for coming out! Myself and the team appreciate...",
      engagementStat: "Professional Studio",
      lastActive: "12/04/25 - 2:45 AM",
    },
    {
      rank: "#3",
      name: "James D. Shola",
      email: "jamesdshola@gmail.com",
      post: "Had the perfect time today at North carolina. Thank you for coming out! Myself and the team appreciate...",
      engagementStat: "Talent Agency",
      lastActive: "19/04/25 - 10:14 PM",
    },
  ];
  
  export default function TopPerformers() {
    const [isCardView, setIsCardView] = useState(false);
  
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-light text-sm">TOP PERFORMERS</h3>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCardView(false)}
            >
              <Image src={Crd} alt="" className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCardView(true)}
            >
              <Image src={Lis} alt="" className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {isCardView ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performers.map((performer) => (
              <Card key={performer.rank} className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <img
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${performer.name}`}
                    alt={performer.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{performer.name}</div>
                    <div className="text-sm text-gray-500">{performer.email}</div>
                    <div className="text-xs text-gray-400">{performer.engagementStat}</div>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">{performer.rank}</div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-700">{performer.post}</p>
                  <div className="text-xs text-gray-500 mt-2">Last Active: {performer.lastActive}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Engagement Stat</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performers.map((performer) => (
                <TableRow key={performer.rank}>
                  <TableCell>{performer.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${performer.name}`}
                        alt={performer.name}
                        className="w-6 h-6 rounded-full"
                      />
                      {performer.name}
                    </div>
                  </TableCell>
                  <TableCell>Had the perfect time tod...</TableCell>
                  <TableCell>{performer.engagementStat}</TableCell>
                  <TableCell>{performer.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }