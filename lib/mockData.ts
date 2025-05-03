export const usersData = [
    {
      id: "0001",
      name: "Daniel Aderi C.",
      email: "danieladeri@yahoo.com",
      profileType: "Musician",
      status: "Active",
      verified: true,
      lastLogin: "19/04/25 • 9:00 AM",
      image: "https://via.placeholder.com/150/0001",
    },
    {
      id: "0002",
      name: "Michael Ajob E.",
      email: "michaelajob@gmail.com",
      profileType: "Professional Studio",
      status: "Active",
      verified: true,
      lastLogin: "12/04/25 • 2:45 AM",
      image: "https://via.placeholder.com/150/0002",
    },
    {
      id: "0004",
      name: "James D. Shola",
      email: "jamesshola@gmail.com",
      profileType: "Talent Agency",
      status: "Suspended",
      verified: true,
      lastLogin: "19/04/25 • 10:14 PM",
      image: "https://via.placeholder.com/150/0004",
    },
    {
      id: "0005",
      name: "Anit Adeboyo",
      email: "adeboyoanit@gmail.com",
      profileType: "Music Business Coa...",
      status: "Active",
      verified: true,
      lastLogin: "20/04/25 • 10:00 AM",
      image: "https://via.placeholder.com/150/0005",
    },
    {
      id: "0006",
      name: "Amakiri Justina",
      email: "amakirijustina@gmail.com",
      profileType: "Producer",
      status: "Deactivated",
      verified: true,
      lastLogin: "01/03/25 • 1:00 AM",
      image: "https://via.placeholder.com/150/0006",
    },
  ];
  
  export const bookingsData = [
    {
      id: "BK-001",
      clientName: "Daniel Aderi C.",
      providerName: "Music Minds Studio",
      serviceOffered: "Concert",
      totalAmount: "$500",
      status: "Confirmed",
      lastLogin: "Apr 19, 2025 • 09:00 AM",
    },
    {
      id: "BK-002",
      clientName: "Michael Ajob E.",
      providerName: "SoundWave Productions",
      serviceOffered: "Studio Session",
      totalAmount: "$300",
      status: "Pending",
      lastLogin: "Apr 12, 2025 • 02:30 PM",
    },
    {
      id: "BK-003",
      clientName: "James D. Shola",
      providerName: "Talent Agency Inc.",
      serviceOffered: "Talent Showcase",
      totalAmount: "$200",
      status: "Cancelled",
      lastLogin: "Apr 19, 2025 • 11:15 AM",
    },
  ];
  
  export const transactionsData = [
    {
      id: "T001",
      clientName: "Daniel Aderi C.",
      bookingId: "B001",
      providerName: "Music Minds Studio",
      serviceOffered: "Concert",
      totalAmount: "$500",
      status: "Completed",
      lastLogin: "19/04/25 • 9:00 AM",
      image: "https://via.placeholder.com/150/0001",
    },
    {
      id: "T002",
      clientName: "Michael Ajob E.",
      bookingId: "B002",
      providerName: "SoundWave Productions",
      serviceOffered: "Studio Session",
      totalAmount: "$300",
      status: "Pending",
      lastLogin: "12/04/25 • 2:30 PM",
      image: "https://via.placeholder.com/150/0001",
    },
    {
      id: "T003",
      clientName: "James D. Shola",
      bookingId: "B003",
      providerName: "Talent Agency Inc.",
      serviceOffered: "Talent Showcase",
      totalAmount: "$200",
      status: "Failed",
      lastLogin: "19/04/25 • 11:15 AM",
      image: "https://via.placeholder.com/150/0001",
    },
  ];

  export const supportData = [
    {
      id: "AN-001",
      user: "Daniel Aderi C.",
      issue: "Login issue",
      priority: "High",
      status: "In progress",
      createdDate: "19/04/25 • 9:00 AM",
    },
    {
      id: "AN-002",
      user: "Michael Ajob E.",
      issue: "Payment failed",
      priority: "Medium",
      status: "Resolved",
      createdDate: "19/04/25 • 9:00 AM",
    },
    {
      id: "AN-003",
      user: "James D. Shola",
      issue: "Failed OTP",
      priority: "Low",
      status: "Open",
      createdDate: "19/04/25 • 9:00 AM"
    }
  ]

  export const adminData = [
    {
      name: "Daniel Aderi C.",
      email: "danieladeri@yahoo.com",
      role: "Admin",
      dateAdded:"Pending",
      lastLogin: "",
    },
    
  ]