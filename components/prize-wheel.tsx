"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, Award } from "lucide-react";
import type { Prize } from "@/types/database";
import { savePrizeWin } from "@/app/actions/prizes";

interface PrizeWheelProps {
  userId: string;
  prizes: Prize[];
}

export function PrizeWheel({ userId, prizes }: PrizeWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0); // Rotation in degrees
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [prizeCode, setPrizeCode] = useState<string>("");
  const [showPrize, setShowPrize] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const baseOffset = 360 / prizes.length / 2; // Offset to align index 0 with top (12 o’clock)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Draw the wheel
  useEffect(() => {
    if (!isClient || prizes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const segmentAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rotate wheel drawing -90 deg so index 0 is at the top
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-centerX, -centerY);

    prizes.forEach((prize, index) => {
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        index * segmentAngle,
        (index + 1) * segmentAngle
      );
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(index * segmentAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = prize.text_color;
      ctx.font = "bold 16px Arial";
      ctx.fillText(prize.name, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // restore unrotated context
  }, [isClient, prizes]);

  // Spin the wheel
  const spinWheel = async () => {
    if (isSpinning || prizes.length === 0) return;
    setIsSpinning(true);

    // Weighted random selection
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    const randomValue = Math.random() * totalProbability;

    let cumulative = 0;
    let selectedIndex = 0;
    for (let i = 0; i < prizes.length; i++) {
      cumulative += prizes[i].probability;
      if (randomValue <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    // Rotation calculations
    const segmentAngle = 360 / prizes.length;
    const targetAngle = selectedIndex * segmentAngle;

    // Current wheel angle in 0-360 range
    const currentAngle = rotation % 360;

    // Compute shortest forward distance to target
    let deltaAngle = targetAngle - currentAngle;
    if (deltaAngle < 0) deltaAngle += 360;

    // Add full spins + angle to land on prize
    const spinDegrees = 360 * 3 + deltaAngle;
    const finalRotation = rotation + spinDegrees;

    setRotation(finalRotation);


    setTimeout(async () => {
      const prize = prizes[selectedIndex];
      setSelectedPrize(prize);

      if (prize.name !== "Try Again") {
        const savedPrize = await savePrizeWin(userId, prize.id, prize.name);
        if (savedPrize) setPrizeCode(savedPrize.code);
      }

      setShowPrize(true);
      setIsSpinning(false);

      if (prize.name !== "Try Again" && typeof window !== "undefined") {
        import("canvas-confetti")
          .then((confetti) => {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          })
          .catch(console.error);
      }
    }, 5000);
  };

  if (!isClient || prizes.length === 0) {
    return <div className="w-[300px] h-[300px] bg-gray-200 rounded-full animate-pulse" />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-white z-10" />

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="relative w-[300px] h-[300px] rounded-full overflow-hidden transition-transform"
          style={{
            transform: `rotate(-${rotation + baseOffset}deg)`,
            transition: isSpinning ? "transform 5s ease-out" : "none",
          }}
        >
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="absolute top-0 left-0"
          />
        </div>
      </div>

      <Button
        size="lg"
        onClick={spinWheel}
        disabled={isSpinning}
        className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100"
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel"}
      </Button>

      {/* Prize Dialog */}
      <Dialog open={showPrize} onOpenChange={setShowPrize}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-center gap-2">
              {selectedPrize?.name === "Try Again" ? (
                <span>Better Luck Next Time!</span>
              ) : (
                <>
                  <Award className="h-6 w-6 text-yellow-500" />
                  <span>Congratulations!</span>
                  <Award className="h-6 w-6 text-yellow-500" />
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              {selectedPrize?.name === "Try Again" ? (
                <p className="text-lg">Don't worry, you can try again!</p>
              ) : (
                <>
                  <p className="text-lg">You've won:</p>
                  <div className="mt-4 mb-6 flex items-center justify-center">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg shadow-lg">
                      <div className="flex items-center gap-3 text-white text-2xl font-bold">
                        <Gift className="h-8 w-8" />
                        <span>{selectedPrize?.name}</span>
                      </div>
                    </div>
                  </div>
                  <p>
                    Use code <span className="font-bold">{prizeCode}</span> at
                    checkout
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setShowPrize(false);
                // setRotation(0); // Reset spin
                router.refresh(); // Optional if you want a fresh server fetch
              }}
            >
              {"Spin again!"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
