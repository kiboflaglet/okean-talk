"use client"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash, Ellipsis, Phone, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Room } from "@/lib/types"
import { Debug } from "@/components/custom/log"

interface RoomCardProps {
    room: Room
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onJoin: (id: string) => void
}

export default function RoomCard({ room, onEdit, onDelete, onJoin }: RoomCardProps) {
    return (
        <Card className="max-w-md border-none">
            <CardHeader>
                <div className="flex justify-between items-center gap-4">
                    <span className="truncate">{room.name}</span>

                    <div className="flex gap-3 items-center" >

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info className="opacity-40" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent >
                                <div className="flex items-center gap-2">

                                    <Avatar className="size-9">
                                        <AvatarImage src={room.owner?.picture || ""} alt="user-picture" />
                                        <AvatarFallback>{"LK"}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-1 flex flex-col">
                                        <p className="text-sm font-medium">{room.owner?.name}</p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>



                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>

                                <Button variant="outline" size="icon">
                                    <Ellipsis />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mt-2">
                                <DropdownMenuItem onClick={() => onEdit(room.id)}>
                                    <Edit className="mr-1" /> Edit the room
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(room.id)}
                                    className="text-red-600"
                                >
                                    <Trash className="mr-1 text-inherit" /> Delete the room
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-3 max-w-full">
                    {room?.room_users?.map((item: any, i: number) => (
                        <Avatar key={i} className="ring-ring ring-2 h-12 w-12">
                            <AvatarImage
                                src={item.users?.picture || ""}
                                alt="User Avatar"
                            />
                            <AvatarFallback className="text-xs">
                                {item.users?.name
                                    ?.split(" ")
                                    .map((part: string) => part[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ))}

                    {/* Fill empty slots up to limit */}
                    {Array.from({
                        length: Math.max(0, (room?.limit ?? 0) - (room?.room_users?.length ?? 0)),
                    }).map((_, i) => (
                        <Avatar
                            key={`empty-${i}`}
                            className="border-2 p-5 border-dashed border-gray-400 opacity-40 bg-transparent"
                        />
                    ))}
                </div>
            </CardContent>

            <CardFooter className="justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
                <Button
                    disabled={room.limit === room.room_users?.length}
                    onClick={() => onJoin(room.id)}
                    className="w-full bg-blue-800 hover:bg-blue-950 text-white cursor-pointer"
                >
                    Join and talk <Phone />
                </Button>
            </CardFooter>
        </Card >
    )
}
