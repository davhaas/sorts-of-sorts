// canvas_renderer.js - Graphics Context Drawing Engine

export function drawWorkspace(appContext) {
    const { canvas, ctx, width, height, array, vm, speedDelay, sortedAnimationActive, sortedAnimationProgress } = appContext;
    const N = array.length;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    if (N === 0) return;

    // Draw grid guide lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        const yLine = (height * i) / 5;
        ctx.beginPath();
        ctx.moveTo(0, yLine);
        ctx.lineTo(width, yLine);
        ctx.stroke();
    }

    const colWidth = width / N;
    const showArrayBoxes = colWidth >= 12;
    const showArrayNumbers = colWidth >= 28;

    const arrayAreaHeight = showArrayBoxes ? 45 : 0;
    const topMargin = 30;
    const bottomMargin = 15;
    const ballWorkspaceHeight = height - arrayAreaHeight - topMargin - bottomMargin;
    const useShadows = N <= 100 && speedDelay >= 50;

    const compIndices = vm.activeCompare;
    const assignIndices = vm.activeAssign;

    // 1. RENDER CONFLICT LINES
    for (let i = 0; i < N; i++) {
        const val = array[i];
        const x = i * colWidth + colWidth / 2;
        const scaleFactor = (N > 1) ? (val - 1) / (N - 1) : 0.5;
        const y = topMargin + ballWorkspaceHeight - (scaleFactor * ballWorkspaceHeight);

        let isComparing = compIndices.includes(i);
        let isAssigning = assignIndices.includes(i);

        if (isComparing || isAssigning) {
            if (isComparing) {
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
                ctx.lineWidth = 2;
            } else if (isAssigning) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                ctx.lineWidth = 2.5;
            }

            const ballRadius = Math.max(3, Math.min(colWidth * 0.35, 20));
            const yLineStart = y + ballRadius;
            const yLineEnd = height - arrayAreaHeight;

            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(x, yLineStart);
            ctx.lineTo(x, yLineEnd);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // 2. RENDER ARRAY BOXES
    if (showArrayBoxes) {
        const yBoxStart = height - arrayAreaHeight;

        for (let i = 0; i < N; i++) {
            const val = array[i];
            const xStart = i * colWidth;

            let isComparing = compIndices.includes(i);
            let isAssigning = assignIndices.includes(i);
            let isSorted = vm.isDone && (!sortedAnimationActive || i <= sortedAnimationProgress);

            if (isComparing) {
                ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
                ctx.strokeStyle = '#f59e0b';
            } else if (isAssigning) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                ctx.strokeStyle = '#ef4444';
            } else if (isSorted) {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                ctx.strokeStyle = '#10b981';
            } else {
                ctx.fillStyle = 'rgba(20, 20, 30, 0.4)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            }

            ctx.lineWidth = 1;
            ctx.fillRect(xStart + 1, yBoxStart + 1, colWidth - 2, arrayAreaHeight - 12);
            ctx.strokeRect(xStart + 1, yBoxStart + 1, colWidth - 2, arrayAreaHeight - 12);

            if (showArrayNumbers) {
                ctx.fillStyle = (isComparing || isAssigning || isSorted) ? '#fff' : 'rgba(255, 255, 255, 0.7)';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val.toString(), xStart + colWidth / 2, yBoxStart + (arrayAreaHeight - 12) / 2);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.font = '9px monospace';
                ctx.fillText(`i:${i}`, xStart + colWidth / 2, height - 5);
            }
        }
    }

    // 3. RENDER BALLS ON TOP
    for (let i = 0; i < N; i++) {
        const val = array[i];
        const x = i * colWidth + colWidth / 2;
        const scaleFactor = (N > 1) ? (val - 1) / (N - 1) : 0.5;
        const y = topMargin + ballWorkspaceHeight - (scaleFactor * ballWorkspaceHeight);

        const ballRadius = Math.max(3, Math.min(colWidth * 0.35, 20));

        let isComparing = compIndices.includes(i);
        let isAssigning = assignIndices.includes(i);
        let isSorted = vm.isDone && (!sortedAnimationActive || i <= sortedAnimationProgress);

        const grad = ctx.createRadialGradient(
            x - ballRadius / 3,
            y - ballRadius / 3,
            ballRadius / 10,
            x,
            y,
            ballRadius
        );

        if (isComparing) {
            grad.addColorStop(0, '#fef3c7');
            grad.addColorStop(0.2, '#fbbf24');
            grad.addColorStop(1, '#b45309');
            if (useShadows) {
                ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
                ctx.shadowBlur = 12;
            }
        } else if (isAssigning) {
            grad.addColorStop(0, '#fee2e2');
            grad.addColorStop(0.2, '#f87171');
            grad.addColorStop(1, '#991b1b');
            if (useShadows) {
                ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
                ctx.shadowBlur = 12;
            }
        } else if (isSorted) {
            grad.addColorStop(0, '#d1fae5');
            grad.addColorStop(0.2, '#34d399');
            grad.addColorStop(1, '#065f46');
            if (useShadows) {
                ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
                ctx.shadowBlur = 6;
            }
        } else {
            grad.addColorStop(0, '#e0e7ff');
            grad.addColorStop(0.2, '#818cf8');
            grad.addColorStop(1, '#3730a3');
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (ballRadius > 6) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(x - ballRadius / 3, y - ballRadius / 3, ballRadius / 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
