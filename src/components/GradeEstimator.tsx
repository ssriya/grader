import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator } from 'lucide-react';
import { getLetterGrade } from '@/lib/grading';

interface GradeEstimatorProps {
  currentGrade: number | null;
}

export default function GradeEstimator({ currentGrade }: GradeEstimatorProps) {
  const [desiredGrade, setDesiredGrade] = useState('90');
  const [remainingWeight, setRemainingWeight] = useState('30');
  const [neededScore, setNeededScore] = useState<number | null>(null);

  const calculateNeededScore = () => {
    const desired = parseFloat(desiredGrade);
    const remaining = parseFloat(remainingWeight) / 100;
    const current = currentGrade || 0;
    const currentWeight = 1 - remaining;

    // Formula: (desired - current * currentWeight) / remaining
    const needed = (desired - current * currentWeight) / remaining;
    setNeededScore(needed);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calculator className="w-4 h-4 mr-2" />
          Grade Estimator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Estimator</DialogTitle>
          <CardDescription>
            Calculate what score you need on remaining work to achieve your desired grade
          </CardDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {currentGrade !== null 
                  ? `${currentGrade.toFixed(1)}% (${getLetterGrade(currentGrade)})`
                  : 'No grades yet'
                }
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desired-grade">Desired Final Grade (%)</Label>
              <Input
                id="desired-grade"
                type="number"
                min="0"
                max="100"
                value={desiredGrade}
                onChange={(e) => setDesiredGrade(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining-weight">Remaining Weight (%)</Label>
              <Input
                id="remaining-weight"
                type="number"
                min="0"
                max="100"
                value={remainingWeight}
                onChange={(e) => setRemainingWeight(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of total grade that is still ungraded
              </p>
            </div>

            <Button onClick={calculateNeededScore} className="w-full">
              Calculate
            </Button>
          </div>

          {neededScore !== null && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">You Need</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {neededScore.toFixed(1)}% ({getLetterGrade(neededScore)})
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {neededScore > 100 
                    ? 'This goal may not be achievable with current grades'
                    : neededScore < 0
                    ? 'You have already exceeded this goal!'
                    : 'on remaining assignments to reach your goal'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
