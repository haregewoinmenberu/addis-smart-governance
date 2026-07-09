<?php

namespace App\Enums;

enum ExamResult: string
{
    case PASS = 'pass';
    case FAIL = 'fail';
    case RETAKE = 'retake';
    case APPEAL = 'appeal';

    public function label(): string
    {
        return match($this) {
            self::PASS => 'Pass',
            self::FAIL => 'Fail',
            self::RETAKE => 'Retake',
            self::APPEAL => 'Appeal',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PASS => 'green',
            self::FAIL => 'red',
            self::RETAKE => 'yellow',
            self::APPEAL => 'blue',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
