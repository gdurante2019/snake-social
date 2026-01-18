import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

export const DeleteAccountDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteAccount } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                toast({
                    title: "Account Deleted",
                    description: "Your account and data have been permanently removed.",
                });
                navigate('/');
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete account.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setIsOpen(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="font-pixel text-xs">
                    <Trash2 className="h-3 w-3 mr-2" />
                    DELETE ACCOUNT
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="arcade-border bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-pixel text-destructive">DELETE ACCOUNT?</AlertDialogTitle>
                    <AlertDialogDescription className="font-mono text-xs">
                        This action cannot be undone. This will permanently delete your
                        account, high scores, and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="font-pixel text-xs">CANCEL</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-pixel text-xs"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "DELETING..." : "DELETE PERMANENTLY"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
