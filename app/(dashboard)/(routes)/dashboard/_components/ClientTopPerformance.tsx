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
  
  interface ClientPerformer {
    rank: string;
    name: string;
    email: string;
    servicesBooked: number;
    reviewsMade: number;
    totalSpent: string;
    engagementStat: string;
  }
  
  const clientPerformers: ClientPerformer[] = [
    {
      rank: "#1",
      name: "Daniel Adaeri C.",
      email: "danieladaeri@yahoo.com",
      servicesBooked: 25,
      reviewsMade: 18,
      totalSpent: "$25,000",
      engagementStat: "Musician",
    },
    {
      rank: "#2",
      name: "Michael Ajobi E.",
      email: "michaelajobi@gmail.com",
      servicesBooked: 20,
      reviewsMade: 15,
      totalSpent: "$20,000",
      engagementStat: "Professional Studio",
    },
    {
      rank: "#3",
      name: "James D. Shola",
      email: "jamesdshola@gmail.com",
      servicesBooked: 18,
      reviewsMade: 14,
      totalSpent: "$16,790",
      engagementStat: "Talent Agency",
    },
  ];
  
  export default function ClientTopPerformers() {
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
            {clientPerformers.map((performer) => (
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
                  <div className="text-sm text-gray-700">
                    No. of Services Booked: {performer.servicesBooked}
                  </div>
                  <div className="text-sm text-gray-700">
                    No. of Reviews Made: {performer.reviewsMade}
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    Total Amount Spent: {performer.totalSpent}
                  </div>
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
                <TableHead>No. of Services Booked</TableHead>
                <TableHead>No. of Reviews Made</TableHead>
                <TableHead>Total Amount Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientPerformers.map((performer) => (
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
                  <TableCell>{performer.servicesBooked}</TableCell>
                  <TableCell>{performer.reviewsMade}</TableCell>
                  <TableCell>{performer.totalSpent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }