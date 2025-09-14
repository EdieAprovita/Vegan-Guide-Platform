"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface HelpfulVotesProps {
  reviewId: string;
  helpfulCount: number;
  helpfulUsers: string[];
  onVoteChange: (reviewId: string, isHelpful: boolean, newCount: number) => void;
  disabled?: boolean;
}

export const HelpfulVotes = ({
  reviewId,
  helpfulCount,
  helpfulUsers,
  onVoteChange,
  disabled = false,
}: HelpfulVotesProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isVoting, setIsVoting] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(helpfulCount);
  const [localHelpfulUsers, setLocalHelpfulUsers] = useState<string[]>(helpfulUsers);

  const userHasVoted = user ? localHelpfulUsers.includes(user._id) : false;

  const handleVote = async (voteType: "helpful" | "not-helpful") => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para votar");
      return;
    }

    if (disabled || isVoting) return;

    setIsVoting(true);

    try {
      // Optimistic update
      const newHelpfulUsers = [...localHelpfulUsers];
      const newHelpfulCount = localHelpfulCount;

      if (voteType === "helpful") {
        if (userHasVoted) {
          // Remove helpful vote
          const userIndex = newHelpfulUsers.indexOf(user!._id);
          if (userIndex > -1) {
            newHelpfulUsers.splice(userIndex, 1);
            setLocalHelpfulCount(newHelpfulCount - 1);
          }
        } else {
          // Add helpful vote
          newHelpfulUsers.push(user!._id);
          setLocalHelpfulCount(newHelpfulCount + 1);
        }
      }

      setLocalHelpfulUsers(newHelpfulUsers);

      // Call API to update vote
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: userHasVoted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el voto");
      }

      // Update parent component
      onVoteChange(
        reviewId,
        voteType === "helpful",
        userHasVoted ? newHelpfulCount - 1 : newHelpfulCount + 1
      );

      // Show success message
      if (voteType === "helpful") {
        if (userHasVoted) {
          toast.success("Voto útil removido");
        } else {
          toast.success("¡Gracias por tu voto útil!");
        }
      }
    } catch (error) {
      console.error("Error voting:", error);

      // Revert optimistic update on error
      setLocalHelpfulCount(helpfulCount);
      setLocalHelpfulUsers(helpfulUsers);

      toast.error("Error al procesar tu voto. Intenta nuevamente.");
    } finally {
      setIsVoting(false);
    }
  };

  const getVoteButtonVariant = (type: "helpful" | "not-helpful") => {
    if (type === "helpful" && userHasVoted) {
      return "default";
    }
    return "outline";
  };

  const getVoteButtonClass = (type: "helpful" | "not-helpful") => {
    const baseClass = "flex items-center gap-2 transition-all";

    if (type === "helpful" && userHasVoted) {
      return `${baseClass} bg-green-600 text-white hover:bg-green-700 border-green-600`;
    }

    if (type === "helpful") {
      return `${baseClass} hover:bg-green-50 hover:text-green-600 hover:border-green-300`;
    }

    return baseClass;
  };

  return (
    <div className="space-y-3">
      {/* Vote Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant={getVoteButtonVariant("helpful")}
          size="sm"
          onClick={() => handleVote("helpful")}
          disabled={disabled || isVoting}
          className={getVoteButtonClass("helpful")}
        >
          {userHasVoted ? <CheckCircle className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
          {userHasVoted ? "Votado" : "Útil"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote("not-helpful")}
          disabled={disabled || isVoting}
          className="flex items-center gap-2 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <ThumbsDown className="h-4 w-4" />
          No útil
        </Button>
      </div>

      {/* Vote Count and Status */}
      <div className="flex items-center gap-3 text-sm">
        {localHelpfulCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <ThumbsUp className="mr-1 h-3 w-3" />
              {localHelpfulCount} voto{localHelpfulCount !== 1 ? "s" : ""} útil
              {localHelpfulCount !== 1 ? "es" : ""}
            </Badge>
          </div>
        )}

        {userHasVoted && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Has marcado esta review como útil</span>
          </div>
        )}

        {!isAuthenticated && <span className="text-gray-500">Inicia sesión para votar</span>}
      </div>

      {/* Loading State */}
      {isVoting && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          Procesando voto...
        </div>
      )}
    </div>
  );
};
