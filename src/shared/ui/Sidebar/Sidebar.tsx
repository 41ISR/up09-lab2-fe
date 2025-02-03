import { useEffect, useState } from "react"
import useUserStore from "../../../entity/user/user.store"
import useMessageStore, { Message } from "../../../entity/message/message.store"
import io from "socket.io-client"

const socket = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket", "polling"],
})

const Sidebar = ({ onSelectUser }: { onSelectUser: (id: string) => void }) => {
    const [activeTab, setActiveTab] = useState<"chats" | "users">("chats")
    const [activeChats, setActiveChats] = useState<string[]>([])
    const { users, setUsers } = useUserStore()
    const { messages } = useMessageStore()

    useEffect(() => {
        socket.on("users", (newUsers) => {
            setUsers(newUsers)
        })

        return () => {
            socket.off("users")
        }
    }, [setUsers])

    useEffect(() => {
        setActiveChats([...new Set(messages.map((msg) => msg.from))])
    }, [messages])

    return (
        <div className="sidebar">
            <div className="tabs">
                <button onClick={() => setActiveTab("chats")}>Chats</button>
                <button onClick={() => setActiveTab("users")}>Users</button>
            </div>
            <div className="content">
                {activeTab === "chats" ? (
                    <div>
                        <h2>Chats</h2>
                        <ul>
                            {activeChats.map((msg, index) => (
                                <li
                                    key={index}
                                    onClick={() => onSelectUser(msg)}
                                >
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <h2>Users</h2>
                        <ul>
                            {users.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={() => onSelectUser(user.id)}
                                >
                                    {user.id}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sidebar
