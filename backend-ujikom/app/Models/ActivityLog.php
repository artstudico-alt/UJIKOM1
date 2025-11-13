<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

class ActivityLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'log_name',
        'description',
        'subject_type',
        'subject_id',
        'causer_type',
        'causer_id',
        'properties',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'properties' => 'collection',
    ];

    /**
     * Get the user that caused the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    /**
     * Get the subject of the activity.
     */
    public function subject()
    {
        if (empty($this->subject_type)) {
            return null;
        }

        return $this->morphTo('subject');
    }

    /**
     * Scope a query to only include activities by a given causer.
     */
    public function scopeCausedBy($query, $causer)
    {
        return $query->where('causer_id', $causer->id)
            ->where('causer_type', get_class($causer));
    }

    /**
     * Scope a query to only include activities for a given subject.
     */
    public function scopeForSubject($query, $subject)
    {
        return $query->where('subject_id', $subject->id)
            ->where('subject_type', get_class($subject));
    }

    /**
     * Scope a query to only include activities with a given log name.
     */
    public function scopeInLog($query, ...$logNames)
    {
        if (is_array($logNames[0])) {
            $logNames = $logNames[0];
        }

        return $query->whereIn('log_name', $logNames);
    }

    /**
     * Get the extra properties with the given name.
     */
    public function getExtraProperty(string $propertyName, mixed $default = null): mixed
    {
        return Arr::get($this->properties->toArray(), $propertyName, $default);
    }
}
